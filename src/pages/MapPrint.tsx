import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

type Course = {
  id: string;
  code: string;
  title: string;
  units: number;
  year_level: number;
  semester: number;
};

type StudentProfile = {
  name: string;
  id_number: string | null;
  email: string;
  program_id: string | null;
  department_id: string | null;
  program_name?: string;
  department_name?: string;
};

type CourseStatus = 'passed' | 'failed' | 'enrolled' | 'not_taken';

// ─── Shared cell styles ───────────────────────────────────────────────────────
const th: React.CSSProperties = {
  padding: '3px 6px',
  textAlign: 'left',
  fontSize: '7pt',
  fontWeight: 700,
  color: '#374151',
  borderBottom: '1.5px solid #9ca3af',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: '7.5pt',
  color: '#1f2937',
  borderBottom: '1px solid #e5e7eb',
  lineHeight: '1.35',
};

// ─── Helper: status label & color ────────────────────────────────────────────
function statusLabel(status: CourseStatus | undefined): string {
  if (!status || status === 'not_taken') return 'Not Taken';
  if (status === 'enrolled') return 'Enrolled';
  if (status === 'passed') return 'Passed';
  if (status === 'failed') return 'Failed';
  return 'Not Taken';
}

function statusColor(status: CourseStatus | undefined): string {
  if (!status || status === 'not_taken') return '#9ca3af';
  if (status === 'passed') return '#16a34a';
  if (status === 'failed') return '#dc2626';
  if (status === 'enrolled') return '#2563eb';
  return '#9ca3af';
}

// ─── Semester table ───────────────────────────────────────────────────────────
function SemesterTable({
  label,
  courses,
  statusMap,
}: {
  label: string;
  courses: Course[];
  statusMap: Record<string, CourseStatus>;
}) {
  return (
    <div style={{ marginBottom: '3px' }}>
      <div
        style={{
          fontSize: '7.5pt',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#4338ca',
          marginBottom: '3px',
          paddingBottom: '2px',
          borderBottom: '1px solid #c7d2fe',
        }}
      >
        {label}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f3ff' }}>
            <th style={{ ...th, width: '25%' }}>Code</th>
            <th style={{ ...th }}>Title</th>
            <th style={{ ...th, width: '9%', textAlign: 'center' }}>Units</th>
            <th style={{ ...th, width: '19%', textAlign: 'center' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, idx) => {
            const status = statusMap[course.id];
            return (
              <tr key={course.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{course.code}</td>
                <td style={{ ...td }}>{course.title}</td>
                <td style={{ ...td, textAlign: 'center' }}>{course.units}</td>
                <td
                  style={{
                    ...td,
                    textAlign: 'center',
                    fontWeight: 700,
                    color: statusColor(status),
                  }}
                >
                  {statusLabel(status)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Info field in header ─────────────────────────────────────────────────────
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: '6pt',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#94a3b8',
          marginBottom: '1px',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '8pt', fontWeight: 600, color: '#1e293b' }}>{value}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MapPrint() {
  const { session } = useAuth();
  const { studentId } = useParams<{ studentId?: string }>();
  const targetUserId = studentId ?? session?.user?.id;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, CourseStatus>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!targetUserId) return;

    const fetchAll = async () => {
      // 1. Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, id_number, email, program_id, department_id')
        .eq('id', targetUserId)
        .single();

      if (!profileData) return;

      // 2. Program & department names
      let programName: string | undefined;
      let departmentName: string | undefined;

      if (profileData.program_id) {
        const { data: prog } = await supabase
          .from('programs')
          .select('name')
          .eq('id', profileData.program_id)
          .single();
        if (prog) programName = prog.name;
      }

      if (profileData.department_id) {
        const { data: dept } = await supabase
          .from('departments')
          .select('name')
          .eq('id', profileData.department_id)
          .single();
        if (dept) departmentName = dept.name;
      }

      setProfile({ ...profileData, program_name: programName, department_name: departmentName });

      // 3. All courses for this program (ordered)
      let courseQuery = supabase
        .from('courses')
        .select('*')
        .order('year_level')
        .order('semester')
        .order('code');

      if (profileData.program_id) {
        courseQuery = courseQuery.eq('program_id', profileData.program_id);
      }

      const { data: coursesData } = await courseQuery;
      if (coursesData) setAllCourses(coursesData);

      // 4. Student terms (ALL statuses — includes currently enrolled terms)
      const { data: termsData } = await supabase
        .from('student_terms')
        .select('*')
        .eq('student_id', targetUserId);

      // 5. Student courses → build status map
      const newStatusMap: Record<string, CourseStatus> = {};

      if (termsData && termsData.length > 0) {
        const termIds = termsData.map((t) => t.id);
        const { data: studentCourses } = await supabase
          .from('student_courses')
          .select('*')
          .in('student_term_id', termIds);

        if (studentCourses) {
          // Priority: passed > enrolled > failed (so retaken courses show enrolled, not failed)
          const priority = (s: string) =>
            s === 'passed' ? 3 : s === 'enrolled' ? 2 : s === 'failed' ? 1 : 0;

          studentCourses.forEach((sc) => {
            const existing = newStatusMap[sc.course_id];
            if (!existing || priority(sc.status) > priority(existing)) {
              newStatusMap[sc.course_id] = sc.status as CourseStatus;
            }
          });
        }
      }

      setStatusMap(newStatusMap);
      setDataLoaded(true);
    };

    fetchAll();
  }, [targetUserId]);

  // Auto-trigger print after data is ready
  useEffect(() => {
    if (!dataLoaded) return;
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, [dataLoaded]);

  // Group courses: year → semester → Course[]
  const grouped: Record<number, Record<number, Course[]>> = {};
  allCourses.forEach((c) => {
    if (!grouped[c.year_level]) grouped[c.year_level] = {};
    if (!grouped[c.year_level][c.semester]) grouped[c.year_level][c.semester] = [];
    grouped[c.year_level][c.semester].push(c);
  });

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          background: #ffffff;
          color: #111827;
        }
        @media print {
          @page { size: 8.5in 13in portrait; margin: 0.16in; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: '7.6in', margin: '0 auto', padding: '0.2in' }}>

        {/* Manual print button */}
        <div
          className="no-print"
          style={{ marginBottom: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}
        >
          {!dataLoaded && (
            <span style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'center' }}>
              Loading data…
            </span>
          )}
          <button
            onClick={() => window.print()}
            disabled={!dataLoaded}
            style={{
              padding: '8px 18px',
              backgroundColor: dataLoaded ? '#4f46e5' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: dataLoaded ? 'pointer' : 'not-allowed',
              fontSize: '13px',
            }}
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        {/* ── Document Header ─────────────────────────────────────────────── */}
        <div
          style={{
            borderBottom: '2px solid #3730a3',
            paddingBottom: '4px',
            marginBottom: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontSize: '11pt',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#1e1b4b',
                }}
              >
                CICS Curriculum Progress Map
              </div>
              <div style={{ fontSize: '7.5pt', color: '#64748b', marginTop: '1px' }}>
                Attained Courses Report
              </div>
            </div>
            <div style={{ fontSize: '7pt', color: '#94a3b8', textAlign: 'right', paddingTop: '2px' }}>
              Generated:{' '}
              {new Date().toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Student info — flat inline row, no card */}
          {profile && (
            <div style={{ marginTop: '4px', fontSize: '7.5pt', color: '#334155', display: 'flex', flexWrap: 'wrap', gap: '0 6px' }}>
              <span><span style={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '6pt', letterSpacing: '0.05em' }}>Name </span>{profile.name}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span><span style={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '6pt', letterSpacing: '0.05em' }}>ID </span>{profile.id_number ?? '—'}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span><span style={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '6pt', letterSpacing: '0.05em' }}>Email </span>{profile.email}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span><span style={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '6pt', letterSpacing: '0.05em' }}>Dept </span>{profile.department_name ?? '—'}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span><span style={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '6pt', letterSpacing: '0.05em' }}>Program </span>{profile.program_name ?? '—'}</span>
            </div>
          )}
        </div>


        {/* ── Curriculum Tables ────────────────────────────────────────────── */}
        {!dataLoaded ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '10pt' }}>
            Loading curriculum data…
          </div>
        ) : (
          <div>
            {[1, 2, 3, 4].map((year) => {
              const sem1 = grouped[year]?.[1] ?? [];
              const sem2 = grouped[year]?.[2] ?? [];
              const summer = grouped[year]?.[3] ?? [];
              const hasAny = sem1.length > 0 || sem2.length > 0 || summer.length > 0;
              if (!hasAny) return null;

              return (
                <div key={year} style={{ marginBottom: '6px', pageBreakInside: 'avoid' }}>
                  {/* Year banner */}
                  <div
                    style={{
                      fontSize: '8.5pt',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#ffffff',
                      backgroundColor: '#3730a3',
                      padding: '2px 8px',
                      borderRadius: '2px',
                      marginBottom: '2px',
                    }}
                  >
                    Year {year}
                  </div>

                  {/* Semesters stacked — each spans full width for long titles */}
                  {(sem1.length > 0 || sem2.length > 0) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: summer.length > 0 ? '3px' : 0 }}>
                      {sem1.length > 0 && (
                        <SemesterTable label="1st Semester" courses={sem1} statusMap={statusMap} />
                      )}
                      {sem2.length > 0 && (
                        <SemesterTable label="2nd Semester" courses={sem2} statusMap={statusMap} />
                      )}
                    </div>
                  )}

                  {/* Summer — full width */}
                  {summer.length > 0 && (
                    <SemesterTable label="Summer" courses={summer} statusMap={statusMap} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

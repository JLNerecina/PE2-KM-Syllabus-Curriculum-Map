import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

type AttainedCourse = Course & {
  status: string;
  term_year: number;
  term_semester: number;
};

export default function Map() {
  const { session, profile } = useAuth();
  const { studentId } = useParams<{ studentId?: string }>();
  const navigate = useNavigate();

  const isViewingOther = !!studentId && studentId !== session?.user?.id;

  useEffect(() => {
    if (isViewingOther && profile?.role === 'student') {
      // Students cannot view other students' maps
      navigate('/map', { replace: true });
    }
  }, [isViewingOther, profile, navigate]);

  const targetUserId = isViewingOther ? studentId : session?.user?.id;

  const [attainedCourses, setAttainedCourses] = useState<AttainedCourse[]>([]);
  const [studentName, setStudentName] = useState<string | null>(null);

  // Fetch student name when viewing another student
  useEffect(() => {
    if (!isViewingOther || !studentId) return;
    supabase.from('profiles').select('name').eq('id', studentId).single().then(({ data }) => {
      if (data) setStudentName(data.name);
    });
  }, [isViewingOther, studentId]);

  useEffect(() => {
    if (!targetUserId) return;

    const fetchData = async () => {
      // 1. Fetch ALL terms (any status) so enrolled courses appear too
      const { data: termsData } = await supabase
        .from('student_terms')
        .select('*')
        .eq('student_id', targetUserId);

      if (!termsData || termsData.length === 0) return;

      const termIds = termsData.map(t => t.id);

      // 2. Fetch student courses
      const { data: stdCourses } = await supabase
        .from('student_courses')
        .select('*')
        .in('student_term_id', termIds);

      if (!stdCourses || stdCourses.length === 0) return;

      // 3. Fetch course details
      const courseIds = stdCourses.map(sc => sc.course_id);
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);

      if (!coursesData) return;

      // Build combined — if a course appears multiple times, prefer passed > enrolled > failed
      const bestStatus: Record<string, { status: string; term_year: number; term_semester: number }> = {};
      stdCourses.forEach(sc => {
        const term = termsData.find(t => t.id === sc.student_term_id);
        if (!term) return;
        const existing = bestStatus[sc.course_id];
        const priority = (s: string) => s === 'passed' ? 3 : s === 'enrolled' ? 2 : 1;
        if (!existing || priority(sc.status) > priority(existing.status)) {
          bestStatus[sc.course_id] = { status: sc.status, term_year: term.year_level, term_semester: term.semester };
        }
      });

      const combined: AttainedCourse[] = Object.entries(bestStatus).map(([courseId, info]) => {
        const course = coursesData.find(c => c.id === courseId);
        return { ...course, ...info } as AttainedCourse;
      });

      setAttainedCourses(combined);
    };

    fetchData();
  }, [targetUserId]);

  const handleDownloadPdf = () => {
    const path = isViewingOther && studentId ? `/map-print/${studentId}` : '/map-print';
    window.open(path, '_blank');
  };

  // Group by year and semester
  const groupedCourses = attainedCourses.reduce((acc, course) => {
    const key = `Y${course.term_year}S${course.term_semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(course);
    return acc;
  }, {} as Record<string, AttainedCourse[]>);

  return (
    <div className="p-8 pb-32">
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-['Space_Grotesk']">
            Curriculum Map{(isViewingOther ? studentName : profile?.name) ? <span className="text-indigo-400"> — {isViewingOther ? studentName : profile?.name}</span> : ''}
          </h1>
          <div className="flex gap-4">
            {isViewingOther && (profile?.role === 'admin' || profile?.role === 'superadmin' || (profile?.role === 'faculty' && profile?.can_edit_curriculum)) && (
              <button 
                onClick={() => navigate(`/tracker/${studentId}`)}
                className="flex items-center gap-2 border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 px-4 py-2 rounded-lg font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Tracker
              </button>
            )}
            <button 
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Download PDF
            </button>
          </div>
        </div>

        {/* The Map Container — dark mode */}
        <div className="bg-[#131b2e] text-slate-200 rounded-xl p-6 border border-slate-800 shadow-xl">
          <div className="text-center mb-6 border-b border-slate-700 pb-5">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">CICS Curriculum Progress</h2>
            <p className="text-slate-400 text-sm mt-1">Attained Courses Map</p>
          </div>

          {Object.keys(groupedCourses).length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              No courses recorded yet. Go to the Tracker to log your progress.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Move the shared card renderer outside the year loop */}
              {(() => {
                const renderCourseCard = (course: AttainedCourse) => (
                  <div key={course.id} className="p-3 border border-slate-700 rounded-xl bg-slate-900/80 mb-2 last:mb-0">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm leading-tight">{course.code}</span>
                      <span className={`inline-block px-2 py-0.5 text-[10px] text-center rounded font-bold whitespace-nowrap ${
                        course.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                        course.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {course.status === 'enrolled' ? 'TAKING' : course.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{course.title}</p>
                  </div>
                );

                const renderYearBlock = (year: number) => {
                  const s1 = groupedCourses[`Y${year}S1`];
                  const s2 = groupedCourses[`Y${year}S2`];
                  const s3 = groupedCourses[`Y${year}S3`];
                  if (!s1 && !s2 && !s3) return <div key={year} />;
                  return (
                    <div key={year} className="min-w-0">
                      <h3 className="text-sm font-bold text-indigo-400 mb-3 border-b border-indigo-500/20 pb-1">
                        Year {year}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Sem 1</h4>
                          {s1 ? <div>{s1.map(renderCourseCard)}</div> : <div className="text-xs text-slate-600 italic">—</div>}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Sem 2</h4>
                          {s2 ? <div>{s2.map(renderCourseCard)}</div> : <div className="text-xs text-slate-600 italic">—</div>}
                        </div>
                      </div>
                      {s3 && s3.length > 0 && (
                        <div className="mt-4 border-t border-dashed border-slate-700 pt-4">
                          <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Summer</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>{s3.map(renderCourseCard)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                };

                return (
                  <>
                    {/* Year 1 & 2 side by side */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      {renderYearBlock(1)}
                      {renderYearBlock(2)}
                    </div>
                    {/* Year 3 & 4 side by side */}
                    <div className="grid grid-cols-2 gap-8">
                      {renderYearBlock(3)}
                      {renderYearBlock(4)}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

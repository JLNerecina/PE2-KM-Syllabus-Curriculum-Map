import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
// @ts-ignore
import html2pdf from 'html2pdf.js';

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
  const mapRef = useRef<HTMLDivElement>(null);

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
      // 1. Fetch terms
      const { data: termsData } = await supabase
        .from('student_terms')
        .select('*')
        .eq('student_id', targetUserId)
        .eq('status', 'completed');
        
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

      const combined: AttainedCourse[] = stdCourses.map(sc => {
        const course = coursesData.find(c => c.id === sc.course_id);
        const term = termsData.find(t => t.id === sc.student_term_id);
        return {
          ...course,
          status: sc.status,
          term_year: term.year_level,
          term_semester: term.semester
        } as AttainedCourse;
      });

      setAttainedCourses(combined);
    };

    fetchData();
  }, [targetUserId]);

  const handleDownloadPdf = () => {
    const element = mapRef.current;
    if (!element) return;

    const opt = {
      margin:       0.5,
      filename:     'CICS_Curriculum_Map.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
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
            {isViewingOther && (profile?.role === 'admin' || profile?.role === 'superadmin') && (
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

        {/* The PDF Container */}
        <div 
          ref={mapRef} 
          className="bg-[#ffffff] text-[#0f172a] rounded-xl p-8 shadow-xl print:shadow-none"
        >
          <div className="text-center mb-8 border-b-2 border-[#e2e8f0] pb-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-[#1e293b]">CICS Curriculum Progress</h2>
            <p className="text-[#64748b] text-sm mt-1">Attained Courses Map</p>
          </div>

          {Object.keys(groupedCourses).length === 0 ? (
            <div className="text-center text-[#94a3b8] py-12">
              No completed courses found. Go to the Tracker to record your progress.
            </div>
          ) : (
            <div className="space-y-8">
              {[1, 2, 3, 4].map(year => {
                const s1 = groupedCourses[`Y${year}S1`];
                const s2 = groupedCourses[`Y${year}S2`];
                const s3 = groupedCourses[`Y${year}S3`];
                if (!s1 && !s2 && !s3) return null;

                return (
                  <div key={year} className="break-inside-avoid">
                    <h3 className="text-lg font-bold text-[#4338ca] mb-4 border-b border-[#e0e7ff] pb-1">
                      Year {year}
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {/* Semester 1 */}
                      <div>
                        <h4 className="text-sm font-bold text-[#64748b] mb-3 uppercase tracking-wider">Semester 1</h4>
                        {s1 ? (
                          <div className="space-y-2">
                            {s1.map(course => (
                              <div key={course.id} className="p-4 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] mb-3 last:mb-0">
                                <div className="flex justify-between items-center gap-2 mb-1">
                                  <span className="font-bold text-[#1e293b] text-sm leading-tight">{course.code}</span>
                                  <span className={`inline-block px-2 h-5 leading-5 text-[10px] text-center rounded font-bold whitespace-nowrap ${
                                    course.status === 'passed' ? 'bg-[#dcfce7] text-[#15803d]' : 
                                    course.status === 'failed' ? 'bg-[#fee2e2] text-[#b91c1c]' : 
                                    'bg-[#dbeafe] text-[#1d4ed8]'
                                  }`}>
                                    {course.status === 'enrolled' ? 'TAKING' : course.status.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#64748b] leading-normal">{course.title}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-[#94a3b8] italic">No courses recorded.</div>
                        )}
                      </div>

                      {/* Semester 2 */}
                      <div>
                        <h4 className="text-sm font-bold text-[#64748b] mb-3 uppercase tracking-wider">Semester 2</h4>
                        {s2 ? (
                          <div className="space-y-2">
                            {s2.map(course => (
                              <div key={course.id} className="p-4 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] mb-3 last:mb-0">
                                <div className="flex justify-between items-center gap-2 mb-1">
                                  <span className="font-bold text-[#1e293b] text-sm leading-tight">{course.code}</span>
                                  <span className={`inline-block px-2 h-5 leading-5 text-[10px] text-center rounded font-bold whitespace-nowrap ${
                                    course.status === 'passed' ? 'bg-[#dcfce7] text-[#15803d]' : 
                                    course.status === 'failed' ? 'bg-[#fee2e2] text-[#b91c1c]' : 
                                    'bg-[#dbeafe] text-[#1d4ed8]'
                                  }`}>
                                    {course.status === 'enrolled' ? 'TAKING' : course.status.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#64748b] leading-normal">{course.title}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-[#94a3b8] italic">No courses recorded.</div>
                        )}
                      </div>
                    </div>
                    {/* Summer Semester */}
                    {s3 && s3.length > 0 && (
                      <div className="mt-6 border-t border-dashed border-[#e2e8f0] pt-6">
                        <h4 className="text-sm font-bold text-[#64748b] mb-3 uppercase tracking-wider">Summer</h4>
                        <div className="grid grid-cols-2 gap-6">
                          {s3.map(course => (
                            <div key={course.id} className="p-4 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] mb-3 last:mb-0 break-inside-avoid">
                              <div className="flex justify-between items-center gap-2 mb-1">
                                <span className="font-bold text-[#1e293b] text-sm leading-tight">{course.code}</span>
                                <span className={`inline-block px-2 h-5 leading-5 text-[10px] text-center rounded font-bold whitespace-nowrap ${
                                  course.status === 'passed' ? 'bg-[#dcfce7] text-[#15803d]' : 
                                  course.status === 'failed' ? 'bg-[#fee2e2] text-[#b91c1c]' : 
                                  'bg-[#dbeafe] text-[#1d4ed8]'
                                }`}>
                                  {course.status === 'enrolled' ? 'TAKING' : course.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#64748b] leading-normal">{course.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
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

type StudentTerm = {
  id: string;
  year_level: number;
  semester: number;
  status: 'locked' | 'unlocked' | 'completed';
};

type StudentCourse = {
  id: string; // Need ID for updating
  course_id: string;
  status: 'passed' | 'failed' | 'enrolled';
  student_term_id: string;
};

type CoursePrerequisite = {
  course_id: string;
  prerequisite_id: string;
};

export default function Tracker() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [activeYear, setActiveYear] = useState<number>(1);
  const [activeSem, setActiveSem] = useState<number>(1);
  
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [studentTerms, setStudentTerms] = useState<StudentTerm[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [prerequisites, setPrerequisites] = useState<CoursePrerequisite[]>([]);
  
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [showOverloadWarning, setShowOverloadWarning] = useState(false);
  const [isOverloading, setIsOverloading] = useState(false);
  
  // Slide-over state
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);

  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);

  // Auto-clear warning message after 5 seconds
  useEffect(() => {
    if (warningMessage) {
      const timer = setTimeout(() => {
        setWarningMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [warningMessage]);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    // Fetch Courses
    const { data: coursesData } = await supabase.from('courses').select('*').order('year_level').order('semester');
    if (coursesData) setAllCourses(coursesData);

    // Fetch Prerequisites
    const { data: prereqsData } = await supabase.from('course_prerequisites').select('*');
    if (prereqsData) setPrerequisites(prereqsData);
    
    // Fetch Student Terms
    const { data: termsData } = await supabase
      .from('student_terms')
      .select('*')
      .eq('student_id', userId)
      .order('year_level')
      .order('semester');
    
    if (termsData) setStudentTerms(termsData);

    // Fetch Student Courses
    if (termsData && termsData.length > 0) {
      const termIds = termsData.map((t: any) => t.id);
      const { data: stdCoursesData } = await supabase
        .from('student_courses')
        .select('*')
        .in('student_term_id', termIds);
        
      if (stdCoursesData) setStudentCourses(stdCoursesData);
    } else {
        setStudentCourses([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync selected courses with already saved ones when tab changes
  useEffect(() => {
    const term = studentTerms.find(t => t.year_level === activeYear && t.semester === activeSem);
    if (term) {
      const savedCourses = studentCourses.filter(sc => sc.student_term_id === term.id).map(sc => sc.course_id);
      setSelectedCourseIds(new Set(savedCourses));
    } else {
      setSelectedCourseIds(new Set());
    }
    setSelectedCourseDetails(null);
  }, [activeYear, activeSem, studentTerms, studentCourses]);

  // Derived state
  const activeTerm = useMemo(() => {
    return studentTerms.find(t => t.year_level === activeYear && t.semester === activeSem);
  }, [studentTerms, activeYear, activeSem]);

  const totalUnits = useMemo(() => {
    let units = 0;
    selectedCourseIds.forEach(id => {
      const c = allCourses.find(course => course.id === id);
      if (c) units += c.units;
    });
    return units;
  }, [selectedCourseIds, allCourses]);

  // Group all courses vertically
  const groupedCourses = useMemo(() => {
    const groups: Record<number, Record<number, Course[]>> = {
      1: { 1: [], 2: [] },
      2: { 1: [], 2: [] },
      3: { 1: [], 2: [] },
      4: { 1: [], 2: [] },
    };
    allCourses.forEach(c => {
      if (groups[c.year_level] && groups[c.year_level][c.semester]) {
        groups[c.year_level][c.semester].push(c);
      }
    });
    return groups;
  }, [allCourses]);

  const getPrereqStatus = useCallback((courseId: string) => {
    const isPassed = studentCourses.some(sc => {
        if (sc.course_id !== courseId) return false;
        if (sc.status === 'passed') return true;
        const term = studentTerms.find(t => t.id === sc.student_term_id);
        return term?.status === 'completed' && sc.status !== 'failed';
    });

    const isTaking = selectedCourseIds.has(courseId) || studentCourses.some(sc => {
        if (sc.course_id !== courseId) return false;
        const term = studentTerms.find(t => t.id === sc.student_term_id);
        return term?.status !== 'completed' && sc.status !== 'failed';
    });

    return { isPassed, isTaking };
  }, [studentCourses, studentTerms, selectedCourseIds]);

  const getMissingPrereqs = useCallback((courseId: string) => {
    const prereqIds = prerequisites.filter(p => p.course_id === courseId).map(p => p.prerequisite_id);
    return prereqIds.filter(pid => {
        const { isPassed } = getPrereqStatus(pid);
        return !isPassed;
    });
  }, [prerequisites, getPrereqStatus]);

  // Effects
  useEffect(() => {
    if (totalUnits > 24 && !isOverloading) {
      setShowOverloadWarning(true);
    } else {
      setShowOverloadWarning(false);
    }
  }, [totalUnits, isOverloading]);

  const handleYearSelect = (targetYear: number) => {
    handleTermSelect(targetYear, 1);
  };

  const handleTermSelect = (targetYear: number, targetSem: number) => {
    // Check if all prior terms are completed.
    const priorTerms = [];
    for(let y=1; y<=4; y++) {
      for(let s=1; s<=2; s++) {
        if (y < targetYear || (y === targetYear && s < targetSem)) {
          priorTerms.push({y, s});
        }
      }
    }
    
    const missing = priorTerms.find(pt => {
      const term = studentTerms.find(st => st.year_level === pt.y && st.semester === pt.s);
      return !term || term.status !== 'completed';
    });

    if (missing) {
      setWarningMessage(`Sequential rule: You must save and complete Year ${missing.y} Semester ${missing.s} before accessing Year ${targetYear} Semester ${targetSem}.`);
      return;
    }

    setActiveYear(targetYear);
    setActiveSem(targetSem);
    setWarningMessage(null);
  };

  const toggleCourseSelection = (courseId: string) => {
    if (activeTerm?.status === 'completed') return; // Cannot edit completed term directly

    setSelectedCourseIds(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        // Check prerequisites
        const prereqIds = prerequisites.filter(p => p.course_id === courseId).map(p => p.prerequisite_id);
        const missingPrereqs = prereqIds.filter(pid => {
          // A prerequisite is met if it was taken in a past, completed term and passed (or was enrolled and the term is completed)
          // Look for passed instances:
          const hasPassed = studentCourses.some(sc => sc.course_id === pid && sc.status === 'passed');
          if (hasPassed) return false; // Not missing

          // What if it is in a completed term but status is 'enrolled'?
          const hasCompletedEnrolled = studentCourses.some(sc => {
             if (sc.course_id !== pid) return false;
             const term = studentTerms.find(t => t.id === sc.student_term_id);
             return term?.status === 'completed' && sc.status !== 'failed';
          });
          if (hasCompletedEnrolled) return false;

          return true; // Missing
        });

        if (missingPrereqs.length > 0) {
          const missingCourses = allCourses.filter(c => missingPrereqs.includes(c.id));
          setWarningMessage(`Cannot select course. Missing prerequisites: ${missingCourses.map(c => c.code).join(', ')}`);
          return prev;
        }

        next.add(courseId);
      }
      return next;
    });
  };

  const handleRetakeCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTerm?.status === 'completed') return;
    
    // Toggle current selection
    setSelectedCourseIds(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        // Check prerequisites even for retake (just in case they failed the prerequisite too?)
        // Usually retake means they took this course and failed. Thus they must have met prereqs before.
        // We can just add it without strict prereq check, or apply it. Let's apply it just to be safe.
        const prereqIds = prerequisites.filter(p => p.course_id === courseId).map(p => p.prerequisite_id);
        const missingPrereqs = prereqIds.filter(pid => {
          const hasPassed = studentCourses.some(sc => sc.course_id === pid && sc.status === 'passed');
          if (hasPassed) return false;
          const hasCompletedEnrolled = studentCourses.some(sc => {
             if (sc.course_id !== pid) return false;
             const term = studentTerms.find(t => t.id === sc.student_term_id);
             return term?.status === 'completed' && sc.status !== 'failed';
          });
          if (hasCompletedEnrolled) return false;
          return true;
        });

        if (missingPrereqs.length > 0) {
          const missingCourses = allCourses.filter(c => missingPrereqs.includes(c.id));
          setWarningMessage(`Cannot retake course. Missing passed prerequisites: ${missingCourses.map(c => c.code).join(', ')}`);
          return prev;
        }

        next.add(courseId);
      }
      return next;
    });
  };

  const confirmEditTerm = async () => {
    if (!activeTerm || !userId) return;

    // Delete all terms that come AFTER the active term
    const termsToDelete = studentTerms.filter(t => 
        t.year_level > activeYear || (t.year_level === activeYear && t.semester > activeSem)
    ).map(t => t.id);

    if (termsToDelete.length > 0) {
        // student_courses has cascading deletes or we delete them explicitly
        await supabase.from('student_terms').delete().in('id', termsToDelete);
    }

    // Update current term to unlocked
    await supabase.from('student_terms').update({ status: 'unlocked' }).eq('id', activeTerm.id);

    await fetchData();
    setIsEditModalOpen(false);
  };

  const saveProgress = async () => {
    if (!userId) return;
    
    if (totalUnits > 24 && !isOverloading) {
      setWarningMessage("Please accept the overload warning first.");
      return;
    }

    // Identify retaken courses (courses selected now but already exist in past terms)
    const retakingIds = Array.from(selectedCourseIds).filter(id => {
       const pastInstance = studentCourses.find(sc => sc.course_id === id && sc.student_term_id !== activeTerm?.id);
       return !!pastInstance;
    });

    // Upsert the current term
    const { data: termData, error: termError } = await supabase
      .from('student_terms')
      .upsert({
        student_id: userId,
        year_level: activeYear,
        semester: activeSem,
        is_overloaded: isOverloading,
        status: 'completed'
      }, { onConflict: 'student_id,year_level,semester' })
      .select()
      .single();

    if (termError || !termData) {
      console.error(termError);
      return;
    }

    // Mark past instances of retaken courses as failed
    for (const id of retakingIds) {
        const pastInstances = studentCourses
            .filter(sc => sc.course_id === id && sc.student_term_id !== activeTerm?.id)
            .sort((a, b) => {
                const termA = studentTerms.find(t => t.id === a.student_term_id);
                const termB = studentTerms.find(t => t.id === b.student_term_id);
                if (!termA || !termB) return 0;
                if (termA.year_level !== termB.year_level) return termB.year_level - termA.year_level;
                return termB.semester - termA.semester;
            });
            
        if (pastInstances.length > 0) {
            const mostRecentPast = pastInstances[0];
            await supabase.from('student_courses').update({status: 'failed'}).eq('id', mostRecentPast.id);
        }
    }

    // Update any OTHER 'enrolled' courses in PAST terms to 'passed'
    const pastTerms = studentTerms.filter(t => t.id !== activeTerm?.id && t.status === 'completed');
    const pastTermIds = pastTerms.map(t => t.id);
    
    if (pastTermIds.length > 0) {
       await supabase.from('student_courses')
           .update({ status: 'passed' })
           .in('student_term_id', pastTermIds)
           .eq('status', 'enrolled');
    }

    // Insert new courses for THIS term as 'enrolled'
    const coursesToInsert = Array.from(selectedCourseIds).map(courseId => ({
      student_term_id: termData.id,
      course_id: courseId,
      status: 'enrolled'
    }));

    await supabase.from('student_courses').delete().eq('student_term_id', termData.id);
    if (coursesToInsert.length > 0) {
        await supabase.from('student_courses').insert(coursesToInsert);
    }

    await fetchData(); // Re-fetch to update UI state
    setIsSuccessModalOpen(true);
    
    // Automatically move to next logical term if possible
    if (activeSem === 1) {
      setActiveSem(2);
    } else {
      if (activeYear < 4) {
        setActiveYear(activeYear + 1);
        setActiveSem(1);
      }
    }
  };

  const finalizeCurriculum = async () => {
    if (!userId) return;
    
    // Find all 'enrolled' courses for this student and mark them 'passed'
    const termIds = studentTerms.map(t => t.id);
    if (termIds.length > 0) {
        await supabase.from('student_courses')
           .update({ status: 'passed' })
           .in('student_term_id', termIds)
           .eq('status', 'enrolled');
    }
    await fetchData();
    setIsFinalizeModalOpen(true);
  };

  return (
    <div className="p-8 pb-32">
      <div className="max-w-[1280px] mx-auto relative">
        <h1 className="text-3xl font-bold font-['Space_Grotesk'] mb-8">Curriculum Tracker</h1>

        {/* Warning Popover (Fixed Floating) */}
        {warningMessage && (
            <div className="fixed top-8 right-8 z-[100] bg-red-500 text-white px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 border border-red-400/20 backdrop-blur-md">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white">warning</span>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <h4 className="font-bold text-sm">Action Required</h4>
                    <p className="text-xs text-white/90 leading-tight">{warningMessage}</p>
                </div>
                <button onClick={() => setWarningMessage(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        )}

        {/* TOP SECTION: Split half and half */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Left: Selectors */}
            <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                    <span className="text-slate-400 font-bold uppercase text-sm tracking-wider w-24">Year Level</span>
                    <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map(y => (
                        <button 
                        key={y}
                        onClick={() => handleYearSelect(y)}
                        className={`px-4 lg:px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                            activeYear === y 
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                        >
                        {y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year
                        </button>
                    ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-bold uppercase text-sm tracking-wider w-24">Semester</span>
                    <div className="flex flex-wrap gap-2">
                    {[1, 2].map(s => (
                        <button 
                        key={s}
                        onClick={() => handleTermSelect(activeYear, s)}
                        className={`px-4 lg:px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                            activeSem === s 
                            ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                        >
                        {s}{s === 1 ? 'st' : 'nd'} Semester
                        </button>
                    ))}
                    </div>
                </div>

                {/* Closed Term Warning */}
                {activeTerm?.status === 'completed' && (
                  <div className="mt-2 p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="material-symbols-outlined text-yellow-500 text-lg">lock</span>
                    <p className="text-[11px] font-bold text-yellow-200/80 leading-tight">
                      This term is <span className="text-yellow-500 uppercase">Closed</span>. Navigate to your current term to track progress, or select <span className="text-white underline">Edit Term</span> to unlock this one.
                    </p>
                  </div>
                )}
            </div>

            {/* Right: Term Summary */}
            <div className="bg-[#131b2e] rounded-2xl p-6 border border-slate-800 flex flex-col justify-center">
               <h3 className="text-lg font-bold text-white mb-2">Term Summary ({activeYear} Year, Sem {activeSem})</h3>
               <div className="flex justify-between items-center py-4 border-b border-slate-800">
                  <span className="text-slate-400">Total Units Selected</span>
                  <span className={`text-2xl font-bold ${totalUnits > 24 ? 'text-red-400' : 'text-indigo-400'}`}>{totalUnits} / 24</span>
               </div>

               {showOverloadWarning && (
                 <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-400 font-bold mb-1 flex items-center gap-1">
                       <span className="material-symbols-outlined" style={{fontSize: '16px'}}>warning</span>
                       Unit Limit Exceeded
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input 
                        type="checkbox" 
                        checked={isOverloading} 
                        onChange={(e) => setIsOverloading(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm font-bold text-slate-300">Allow Overload</span>
                    </label>
                 </div>
               )}

               <div className="mt-auto flex flex-col gap-4 pt-6">
                 <div className="flex gap-4">
                     {activeTerm?.status === 'completed' && (
                         <button 
                             onClick={() => setIsEditModalOpen(true)}
                             className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-slate-700 transition-all border border-slate-700"
                         >
                             Edit Term
                         </button>
                     )}
                     <button 
                        onClick={saveProgress}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={activeTerm?.status === 'completed'}
                     >
                        {activeTerm?.status === 'completed' ? 'Term Saved' : 'Save Progress'}
                     </button>
                 </div>
                 
                 {/* Finalize Curriculum Prompt for 4th Year 2nd Sem */}
                 {activeYear === 4 && activeSem === 2 && activeTerm?.status === 'completed' && (
                     <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <span className="material-symbols-outlined text-green-400 text-3xl mb-2">workspace_premium</span>
                         <h4 className="text-white font-bold mb-1">Graduation Ready?</h4>
                         <p className="text-xs text-slate-400 mb-4">You have completed the final term. Finalize your curriculum to mark your final courses as passed.</p>
                         <button 
                             onClick={finalizeCurriculum}
                             className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-2 rounded-lg shadow-lg transition-all"
                         >
                             Finalize Curriculum
                         </button>
                     </div>
                 )}
               </div>
            </div>
        </div>

        {/* BOTTOM SECTION: Universal Prescribed Courses List */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-indigo-300 mb-8 pb-4 border-b border-indigo-500/20">
              Universal Course List
            </h2>
            
            <div className="w-full">
                {[1, 2, 3, 4].map(y => {
                    const hasCoursesYear = groupedCourses[y][1].length > 0 || groupedCourses[y][2].length > 0;
                    if (!hasCoursesYear) return null;
                    
                    return (
                    <div key={y} className="mb-12">
                        <h3 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">{y}</span>
                            Year
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2].map(s => {
                                const courses = groupedCourses[y][s];
                                if (courses.length === 0) return null;
                                
                                return (
                                    <div key={s} className="pl-6 border-l-2 border-indigo-500/20">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            Semester {s}
                                            {activeYear === y && activeSem === s && (
                                                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[10px]">CURRENT TARGET</span>
                                            )}
                                        </h4>
                                        
                                        <div className="space-y-3">
                                            {courses.map(course => {
                                            const isSelected = selectedCourseIds.has(course.id);
                                            const isTermCompleted = activeTerm?.status === 'completed';
                                            const isTargetTerm = activeYear === course.year_level && activeSem === course.semester;
                                            
                                            // Find past instance logic
                                            const pastInstance = studentCourses.find(sc => sc.course_id === course.id);
                                            const wasTaken = !!pastInstance;
                                            const takenInActiveTerm = pastInstance?.student_term_id === activeTerm?.id;
                                            const canRetake = wasTaken && !takenInActiveTerm && !isTermCompleted;

                                            // Determine interaction state
                                            const missingPrereqs = getMissingPrereqs(course.id);
                                            const isLocked = !wasTaken && missingPrereqs.length > 0;
                                            const isInteractive = (!wasTaken || canRetake || isSelected) && !isTermCompleted && !isLocked;

                                            return (
                                                <div 
                                                    key={course.id}
                                                    onClick={() => {
                                                        if (isInteractive && !canRetake) {
                                                            toggleCourseSelection(course.id);
                                                        }
                                                    }}
                                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all group relative ${
                                                        isSelected 
                                                            ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20' 
                                                            : isLocked
                                                                ? 'bg-slate-900/30 border-slate-800/50 opacity-40 grayscale-[0.5]'
                                                                : wasTaken && !takenInActiveTerm
                                                                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                                                                    : 'bg-slate-900/80 border-slate-700'
                                                    } ${isInteractive && !canRetake ? 'cursor-pointer hover:border-indigo-400/50' : ''}`}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        {isLocked ? (
                                                            <div className="w-6 h-6 flex items-center justify-center text-slate-500">
                                                                <span className="material-symbols-outlined text-[20px]">lock</span>
                                                            </div>
                                                        ) : (
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isSelected || (wasTaken && !takenInActiveTerm)}
                                                                onChange={() => {}} 
                                                                className="w-6 h-6 rounded bg-slate-900 border-slate-600 text-indigo-500 focus:ring-indigo-500 pointer-events-none"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-indigo-400">{course.code}</span>
                                                            <span className="text-xs text-slate-500 font-medium">{course.units} Units</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium mt-1 text-slate-200">{course.title}</p>
                                                            {isLocked && (
                                                                <span className="mt-1 text-[9px] font-black text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1.5 whitespace-nowrap shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                                                    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>
                                                                    Prerequisites not done
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="ml-2 flex items-center gap-3">
                                                        {canRetake && (
                                                            <button 
                                                                onClick={(e) => handleRetakeCourse(course.id, e)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                                    isSelected 
                                                                        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                                                        : 'bg-indigo-500 text-white border-indigo-400 hover:scale-105'
                                                                }`}
                                                            >
                                                                {isSelected ? 'Retaking' : 'Retake'}
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCourseDetails(course);
                                                            }}
                                                            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-cyan-400 transition-all border border-slate-700"
                                                        >
                                                            Info
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Slide-over Course Details */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-slate-950 shadow-2xl border-l border-indigo-500/20 z-[60] flex flex-col transform transition-transform duration-500 ${selectedCourseDetails ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedCourseDetails && (
          <>
            <div className="p-6 border-b border-indigo-500/10 flex items-center justify-between">
              <div>
                <span className="text-indigo-400 text-xs font-bold tracking-wider">COURSE DETAILS</span>
                <h2 className="font-bold text-xl text-white mt-1">{selectedCourseDetails.code}</h2>
              </div>
              <button onClick={() => setSelectedCourseDetails(null)} className="p-2 hover:bg-indigo-500/10 rounded-full text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <h3 className="text-lg font-bold text-slate-200">{selectedCourseDetails.title}</h3>
               <p className="text-sm text-slate-400">Units: {selectedCourseDetails.units}</p>
               <p className="text-sm text-slate-400">Usually taken: Year {selectedCourseDetails.year_level}, Sem {selectedCourseDetails.semester}</p>
               
               <div className="mt-8 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Prerequisites</h4>
                    {prerequisites.filter(p => p.course_id === selectedCourseDetails.id).length > 0 ? (
                        <ul className="space-y-2">
                            {prerequisites
                                .filter(p => p.course_id === selectedCourseDetails.id)
                                .map(p => {
                                    const reqCourse = allCourses.find(c => c.id === p.prerequisite_id);
                                    if (!reqCourse) return null;
                                    const { isPassed, isTaking } = getPrereqStatus(reqCourse.id);

                                    return (
                                        <li key={p.prerequisite_id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-200">{reqCourse.code}</span>
                                                <span className="text-[10px] text-slate-500 line-clamp-1">{reqCourse.title}</span>
                                            </div>
                                            {(isPassed || isTaking) && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                    {isPassed ? 'Passed' : 'Taking'}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No explicit prerequisite data linked.</p>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Required For</h4>
                    {prerequisites.filter(p => p.prerequisite_id === selectedCourseDetails.id).length > 0 ? (
                        <ul className="space-y-2">
                            {prerequisites
                                .filter(p => p.prerequisite_id === selectedCourseDetails.id)
                                .map(p => {
                                    const requiredByCourse = allCourses.find(c => c.id === p.course_id);
                                    if (!requiredByCourse) return null;
                                    const { isPassed, isTaking } = getPrereqStatus(requiredByCourse.id);

                                    return (
                                        <li key={p.course_id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-200">{requiredByCourse.code}</span>
                                                <span className="text-[10px] text-slate-500 line-clamp-1">{requiredByCourse.title}</span>
                                            </div>
                                            {(isPassed || isTaking) && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                    {isPassed ? 'Passed' : 'Taking'}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Not required for any later courses.</p>
                    )}
                </div>
            </div>
          </>
        )}
      </div>
      
      {/* Overlay to close right sidebar (Darkened, no blur) */}
      {selectedCourseDetails && (
        <div 
          className="fixed inset-0 bg-black/40 z-[50] transition-opacity"
          onClick={() => setSelectedCourseDetails(null)}
        />
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsSuccessModalOpen(false)}
          ></div>
          <div className="relative bg-[#131b2e] border border-indigo-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-indigo-400 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-['Space_Grotesk']">Progress Saved!</h3>
              <p className="text-slate-400 text-sm mb-8">
                Your academic journey for Year {activeYear} Semester {activeSem} has been successfully recorded.
              </p>
              <button 
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="relative bg-[#131b2e] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col text-center items-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-red-400 text-4xl">warning</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Edit Completed Term?</h3>
              <p className="text-slate-400 text-sm mb-8">
                Editing Year {activeYear} Semester {activeSem} will <strong>undo and permanently delete</strong> all progress you have saved for any subsequent terms. Are you sure you want to proceed?
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmEditTerm}
                  className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-red-400 transition-all"
                >
                  Yes, Unlock Term
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Curriculum Modal */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500"
            onClick={() => setIsFinalizeModalOpen(false)}
          ></div>
          <div className="relative bg-[#0f172a] border border-green-500/30 rounded-[2rem] p-10 max-w-md w-full shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)] animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-8 mx-auto ring-8 ring-green-500/5">
              <span className="material-symbols-outlined text-green-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-4 font-['Space_Grotesk'] tracking-tight">
              Curriculum Finalized!
            </h3>
            
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Congratulations! All active courses have been marked as <span className="text-green-400 font-bold">Passed</span>. You have successfully completed your curriculum tracking journey.
            </p>
            
            <button 
              onClick={() => setIsFinalizeModalOpen(false)}
              className="w-full bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-4 rounded-2xl shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg"
            >
              Finish Journey
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

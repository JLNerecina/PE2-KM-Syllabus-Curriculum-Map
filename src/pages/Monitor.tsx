import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

interface Program {
  id: string;
  code: string;
  name: string;
}

interface Student extends UserProfile {
  year_level?: number;
  section?: string;
  gwa?: number;
  units_completed?: number;
  total_units?: number;
  status?: string;
}

export default function Monitor() {
  const { profile } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentStats, setSelectedStudentStats] = useState<{unitsPassed: number, unitsTaking: number, totalUnits: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch overseen programs
  useEffect(() => {
    async function fetchPrograms() {
      if (!profile) return;
      
      let query;
      if (profile.role === 'admin' || profile.role === 'superadmin') {
        // Admins see all programs
        query = supabase.from('programs').select('id, code, name');
      } else if (profile.role === 'faculty') {
        // Faculty see overseen programs
        query = supabase
          .from('faculty_overseen_programs')
          .select('programs(id, code, name)')
          .eq('faculty_id', profile.id);
      }

      if (!query) return;

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching programs:', error);
      } else if (data) {
        const parsedPrograms = profile.role === 'faculty' 
          ? data.map((d: any) => d.programs).filter(Boolean)
          : data;
        setPrograms(parsedPrograms);
        if (parsedPrograms.length > 0) {
          setSelectedProgramId(parsedPrograms[0].id);
        }
      }
      setIsLoading(false);
    }
    fetchPrograms();
  }, [profile]);

  // Fetch students when program changes
  useEffect(() => {
    async function fetchStudents() {
      if (!selectedProgramId) return;
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('program_id', selectedProgramId);
      
      if (profilesError) {
        console.error('Error fetching students:', profilesError);
        return;
      }

      setStudents(profilesData as Student[]);
    }
    fetchStudents();
  }, [selectedProgramId]);

  // Fetch accurate stats when student is selected
  useEffect(() => {
    async function fetchStats() {
      if (!selectedStudent) {
        setSelectedStudentStats(null);
        return;
      }
      
      // Fetch courses for the program
      const { data: coursesData } = await supabase.from('courses').select('*').eq('program_id', selectedStudent.program_id);
      
      // Fetch student terms
      const { data: termsData } = await supabase.from('student_terms').select('*').eq('student_id', selectedStudent.id);
      
      // Fetch student courses
      let stdCoursesData: any[] = [];
      if (termsData && termsData.length > 0) {
        const termIds = termsData.map((t: any) => t.id);
        const { data: scData } = await supabase.from('student_courses').select('*').in('student_term_id', termIds);
        if (scData) stdCoursesData = scData;
      }
      
      const courses = coursesData || [];
      const terms = termsData || [];
      const stdCourses = stdCoursesData;
      
      let totalUnits = 0;
      let unitsCompleted = 0;
      
      const uniqueCoursesUnits = courses.reduce((acc, course) => acc + (course.units || 0), 0);
      
      const failedUnits = stdCourses.reduce((acc, sc) => {
        if (sc.status === 'failed') {
          const c = courses.find(course => course.id === sc.course_id);
          return acc + (c?.units || 0);
        }
        return acc;
      }, 0);
      
      totalUnits = uniqueCoursesUnits + failedUnits;
      
      const unitsPassed = stdCourses.reduce((acc, sc) => {
        if (sc.status === 'passed') {
          const c = courses.find(course => course.id === sc.course_id);
          return acc + (c?.units || 0);
        }
        return acc;
      }, 0);
      
      const unitsTaking = stdCourses.reduce((acc, sc) => {
        if (sc.status === 'enrolled') {
          const c = courses.find(course => course.id === sc.course_id);
          return acc + (c?.units || 0);
        }
        return acc;
      }, 0);
      
      setSelectedStudentStats({ unitsPassed, unitsTaking, totalUnits });
    }
    
    fetchStats();
  }, [selectedStudent]);

  // Filter students by search query
  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    return s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.id_number?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent min-h-screen">
      {/* Page Header */}
      <div className="mb-stack-md">
        <h1 className="font-headline-lg text-on-surface mb-2">Faculty Monitoring Hub</h1>
        <p className="text-on-surface-variant max-w-2xl">
          Drill down through academic structures to track student progression and curriculum compliance across your departments.
        </p>
      </div>

      {/* Drill-down Interface */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Navigation Hierarchy */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full min-h-[500px]">
          
          {/* Programs Section */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-label-sm">
                Academic Program
              </span>
            </div>
            {programs.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedProgramId || ''}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value);
                    setSelectedStudent(null);
                  }}
                  className="w-full bg-surface-variant/50 border border-indigo-500/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors appearance-none pr-10 cursor-pointer"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No programs assigned.</p>
            )}
          </div>



          {/* Students List */}
          {selectedProgramId && (
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-cyan-500 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-label-sm">
                  Students
                </span>
                <span className="text-xs text-slate-500">{filteredStudents.length} Students</span>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                  <input 
                    type="search" 
                    placeholder="Search by name or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-variant/30 border border-indigo-500/20 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {filteredStudents.map(student => (
                  <button 
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      selectedStudent?.id === student.id
                        ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-100 font-medium'
                        : 'hover:bg-surface-variant/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-sm">{student.name}</div>
                      <div className="text-xs opacity-60 font-mono mt-1">{student.id_number || 'No ID'}</div>
                    </div>
                  </button>
                ))}
                {filteredStudents.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No students found.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Results & Analysis */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          
          {selectedStudent ? (
            <>
              {/* Focused Student Card */}
              <div className="glass-card rounded-2xl overflow-hidden inner-glow relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10"></div>
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-2xl bg-surface-variant p-1 border border-indigo-500/20 flex items-center justify-center text-4xl text-indigo-300 font-bold uppercase">
                        {selectedStudent.name?.charAt(0) || '?'}
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 border-4 border-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-headline-md text-on-surface">{selectedStudent.name}</h3>
                        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold font-label-sm border border-indigo-500/20">
                          REGULAR
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-4">
                        Student ID: <span className="text-indigo-300 font-mono">{selectedStudent.id_number || 'N/A'}</span> • {programs.find(p => p.id === selectedStudent.program_id)?.code || 'Program'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-surface-container-low rounded-lg p-4 border border-indigo-500/5">
                          <p className="text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Units Passed</p>
                          {selectedStudentStats ? (
                            <p className="text-2xl font-bold text-green-400">{selectedStudentStats.unitsPassed} <span className="text-sm text-slate-500 font-normal">/ {selectedStudentStats.totalUnits}</span></p>
                          ) : (
                            <p className="text-sm text-slate-400 animate-pulse">Calculating...</p>
                          )}
                        </div>
                        <div className="bg-surface-container-low rounded-lg p-4 border border-indigo-500/5">
                          <p className="text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Units Taking</p>
                          {selectedStudentStats ? (
                            <p className="text-2xl font-bold text-cyan-400">{selectedStudentStats.unitsTaking}</p>
                          ) : (
                            <p className="text-sm text-slate-400 animate-pulse">Calculating...</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => window.open(`/map/${selectedStudent.id}`, '_blank')}
                          className="spectral-gradient text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all flex items-center gap-2 group"
                        >
                          <span className="material-symbols-outlined text-sm">map</span>
                          Curriculum Map
                          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Map Progress */}
                <div className="px-8 pb-8">
                  <div className="border-t border-indigo-500/10 pt-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 font-label-sm">Curriculum Roadmap Progress</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-indigo-300">Degree Completion</span>
                      <span className="text-xs text-indigo-300">
                        {selectedStudentStats && selectedStudentStats.totalUnits > 0 ? Math.round(((selectedStudentStats.unitsPassed || 0) / (selectedStudentStats.totalUnits || 1)) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div 
                        className="spectral-gradient h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${selectedStudentStats && selectedStudentStats.totalUnits > 0 ? Math.round(((selectedStudentStats.unitsPassed || 0) / (selectedStudentStats.totalUnits || 1)) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

            </>
          ) : (
            <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center h-[400px]">
              <span className="material-symbols-outlined text-6xl text-indigo-500/20 mb-4">search</span>
              <h3 className="text-xl font-bold text-indigo-300 mb-2">No Student Selected</h3>
              <p className="text-slate-400 max-w-sm">
                Select a program and a student from the sidebar to view their full academic progress.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

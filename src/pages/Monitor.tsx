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
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

      // For a real app, we would fetch student_terms to get their current year, GWA, and units.
      // We will map over them and add some placeholder data based on their id
      const enrichedStudents = (profilesData as Student[]).map(s => ({
        ...s,
        year_level: Math.floor(Math.random() * 4) + 1, // Placeholder
        section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)], // Placeholder
        gwa: (1.0 + Math.random() * 1.5).toFixed(2) as unknown as number, // Placeholder 1.0 to 2.5
        units_completed: Math.floor(Math.random() * 140), // Placeholder
        total_units: 148,
        status: 'Cleared'
      }));

      setStudents(enrichedStudents);
    }
    fetchStudents();
  }, [selectedProgramId]);

  // Filter students by selected year
  const filteredStudents = students.filter(s => 
    selectedYear ? s.year_level === selectedYear : true
  );

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
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          {/* Programs Section */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-label-sm">
                Academic Programs
              </span>
              <span className="text-xs text-slate-500">{programs.length} Active</span>
            </div>
            <div className="space-y-2">
              {programs.map(program => (
                <button 
                  key={program.id}
                  onClick={() => {
                    setSelectedProgramId(program.id);
                    setSelectedYear(null);
                    setSelectedStudent(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    selectedProgramId === program.id 
                      ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-100 group' 
                      : 'hover:bg-surface-variant/50 border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-400">
                      {program.code.includes('CS') ? 'computer' : 'settings_input_component'}
                    </span>
                    <span className="font-medium">{program.name}</span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform ${selectedProgramId === program.id ? 'text-indigo-400 translate-x-1' : ''}`}>
                    chevron_right
                  </span>
                </button>
              ))}
              {programs.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No programs assigned.</p>
              )}
            </div>
          </div>

          {/* Year Levels */}
          {selectedProgramId && (
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-indigo-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-label-sm">
                  Year Levels
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(year => (
                  <button 
                    key={year}
                    onClick={() => {
                      setSelectedYear(selectedYear === year ? null : year);
                      setSelectedStudent(null);
                    }}
                    className={`p-3 rounded-lg transition-all text-center ${
                      selectedYear === year 
                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-100 font-bold'
                        : 'bg-surface-container-high border border-indigo-500/10 text-slate-400 hover:text-indigo-300'
                    }`}
                  >
                    Year {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Students List */}
          {(selectedProgramId || selectedYear) && (
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-cyan-500 max-h-[400px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-label-sm">
                  Students {selectedYear ? `(Year ${selectedYear})` : ''}
                </span>
                <span className="text-xs text-slate-500">{filteredStudents.length} Students</span>
              </div>
              <div className="space-y-2">
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
                    <span className="text-xs opacity-60">Year {student.year_level}-{student.section}</span>
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
                        Student ID: <span className="text-indigo-300 font-mono">{selectedStudent.id_number || 'N/A'}</span> • {programs.find(p => p.id === selectedStudent.program_id)?.code || 'Program'} • Year {selectedStudent.year_level}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-surface-container-low rounded-lg p-3 border border-indigo-500/5">
                          <p className="text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Gen. Weighted Avg</p>
                          <p className="text-xl font-bold text-indigo-400">{selectedStudent.gwa}</p>
                        </div>
                        <div className="bg-surface-container-low rounded-lg p-3 border border-indigo-500/5">
                          <p className="text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Units Completed</p>
                          <p className="text-xl font-bold text-indigo-400">{selectedStudent.units_completed} <span className="text-xs text-slate-500">/ {selectedStudent.total_units}</span></p>
                        </div>
                        <div className="bg-surface-container-low rounded-lg p-3 border border-indigo-500/5">
                          <p className="text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Status</p>
                          <p className="text-xl font-bold text-green-400">{selectedStudent.status}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button className="spectral-gradient text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all flex items-center gap-2 group">
                          <span className="material-symbols-outlined text-sm">grid_view</span>
                          View Curriculum Grid
                          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                        <button className="border border-indigo-500/30 text-indigo-400 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-500/5 transition-all">
                          Download Record
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
                        {Math.round(((selectedStudent.units_completed || 0) / (selectedStudent.total_units || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div 
                        className="spectral-gradient h-full rounded-full" 
                        style={{ width: `${Math.round(((selectedStudent.units_completed || 0) / (selectedStudent.total_units || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Placeholder for Curriculum Grid Preview */}
              <div className="glass-card rounded-2xl p-8 mt-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-headline-md text-on-surface">Curriculum Compliance Matrix</h3>
                    <p className="text-sm text-slate-500">Read-only view of academic milestones and prerequisites.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Passed
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span> In Progress
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                      <span className="w-2 h-2 rounded-full bg-surface-variant border border-white/10"></span> Pending
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Simulated Grid Data based on HTML */}
                  <section>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-4 pb-2 border-b border-indigo-500/10">Year 1 - Foundational</h4>
                    <div className="curriculum-grid">
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-[10px] text-green-400 font-bold mb-1">CS 101</p>
                        <p className="text-xs font-medium leading-tight text-white">Intro to Computing</p>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-[10px] text-green-400 font-bold mb-1">CS 102</p>
                        <p className="text-xs font-medium leading-tight text-white">Comp. Programming I</p>
                      </div>
                    </div>
                  </section>
                  <section>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-4 pb-2 border-b border-indigo-500/10">Year 3 - Advanced (Active)</h4>
                    <div className="curriculum-grid">
                      <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-lg ring-1 ring-indigo-500 ring-offset-2 ring-offset-surface">
                        <p className="text-[10px] text-indigo-300 font-bold mb-1">CS 301</p>
                        <p className="text-xs font-medium leading-tight text-white">Algorithms</p>
                      </div>
                      <div className="p-3 bg-surface-container-highest border border-white/5 rounded-lg opacity-60">
                        <p className="text-[10px] text-slate-400 font-bold mb-1">CS 303</p>
                        <p className="text-xs font-medium leading-tight text-white">Software Engr I</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center h-[400px]">
              <span className="material-symbols-outlined text-6xl text-indigo-500/20 mb-4">search</span>
              <h3 className="text-xl font-bold text-indigo-300 mb-2">No Student Selected</h3>
              <p className="text-slate-400 max-w-sm">
                Select a program, year level, and a student from the sidebar to view their full academic progress and curriculum compliance matrix.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

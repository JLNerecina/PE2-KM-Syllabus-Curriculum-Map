import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { Program, Department } from '../../types';

interface Props {
  programs: Program[];
  departments: Department[];
}

interface BulkRow {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
}

let rowIdCounter = 0;
function makeRow(): BulkRow {
  return { id: `row-${++rowIdCounter}`, studentNumber: '', fullName: '', email: '' };
}

export default function BulkEnrollmentTab({ programs, departments }: Props) {
  const { profile } = useAuth();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [rows, setRows] = useState<BulkRow[]>(() => Array.from({ length: 5 }, makeRow));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredPrograms = programs.filter(p => !selectedDepartmentId || p.department_id === selectedDepartmentId);
  const selectedProgram = programs.find(p => p.id === selectedProgramId);
  const deptId = selectedDepartmentId || selectedProgram?.department_id || '';

  function updateRow(id: string, field: keyof Omit<BulkRow, 'id'>, value: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  function removeRow(id: string) {
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev);
  }

  function addRow() {
    setRows(prev => [...prev, makeRow()]);
  }

  async function handleConfirm() {
    setFeedback(null);
    const validRows = rows.filter(r => r.email.trim());
    if (validRows.length === 0) {
      setFeedback({ type: 'error', message: 'Please fill in at least one row with an email address.' });
      return;
    }
    if (!selectedProgramId) {
      setFeedback({ type: 'error', message: 'Please select a program.' });
      return;
    }

    // Check for duplicate emails within the batch
    const emails = validRows.map(r => r.email.trim());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      setFeedback({ type: 'error', message: 'Duplicate email addresses found in your rows. Each email must be unique.' });
      return;
    }

    setIsSubmitting(true);
    const insertData = validRows.map(r => ({
      email: r.email.trim(),
      role: 'student' as const,
      id_number: r.studentNumber.trim() || null,
      name: r.fullName.trim() || null,
      program_id: selectedProgramId,
      department_id: deptId || null,
      created_by: profile?.id || null,
    }));

    const { error } = await supabase.from('preauthorized_users').upsert(insertData, { onConflict: 'email' });
    
    if (error) {
      setFeedback({ type: 'error', message: `Enrollment failed: ${error.message}` });
    } else {
      // Log bulk enrollment as a single summary audit entry
      await supabase.from('audit_logs').insert({
        actor_id: profile?.id,
        action: 'bulk_enrollment.create',
        target_table: 'preauthorized_users',
        target_id: selectedProgramId,
        target_label: selectedProgram?.code || 'Unknown Program',
        metadata: {
          count: validRows.length,
          program: selectedProgram?.name,
          program_code: selectedProgram?.code,
          students: validRows.map(r => ({
            id_number: r.studentNumber.trim() || null,
            name: r.fullName.trim() || null,
            email: r.email.trim()
          }))
        },
      });
      setFeedback({ type: 'success', message: `Successfully pre-authorized ${validRows.length} student${validRows.length > 1 ? 's' : ''}.` });
      setRows(Array.from({ length: 5 }, makeRow));
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-indigo-400 bg-indigo-500/10 p-2 rounded-lg">group_add</span>
        <h2 className="text-on-surface text-xl font-bold font-['Space_Grotesk']">Bulk Enrollment Protocol</h2>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
          <span className="material-symbols-outlined text-[18px]">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="glass-card rounded-2xl p-8 space-y-6 lg:col-span-1">
          <h3 className="text-sm uppercase tracking-widest text-indigo-300 font-bold">Configuration</h3>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Department</label>
            <select
              value={selectedDepartmentId}
              onChange={e => {
                setSelectedDepartmentId(e.target.value);
                setSelectedProgramId(''); // Reset program when department changes
              }}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Select Department...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Program</label>
            <select
              value={selectedProgramId}
              onChange={e => setSelectedProgramId(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Select Program...</option>
              {filteredPrograms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <p className="text-xs text-indigo-300 leading-relaxed italic">
              Enrollment will automatically pre-authorize students under the selected program. They will be activated upon their first Google sign-in.
            </p>
          </div>
        </div>

        {/* Entry Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-indigo-300 text-[11px] uppercase tracking-widest">
                  <th className="px-6 py-4">S.N.</th>
                  <th className="px-6 py-4">Student Number</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Institutional Email</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-500/10">
                {rows.map((row, i) => (
                  <tr key={row.id} className="group">
                    <td className="px-6 py-4 text-xs text-slate-500">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-6 py-4">
                      <input
                        type="text" placeholder="2024-XXXX" value={row.studentNumber}
                        onChange={e => updateRow(row.id, 'studentNumber', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-full text-sm py-1 text-slate-200 placeholder:text-slate-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text" placeholder="First M. Last" value={row.fullName}
                        onChange={e => updateRow(row.id, 'fullName', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-full text-sm py-1 text-slate-200 placeholder:text-slate-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="email" placeholder="user@cics.student.edu" value={row.email}
                        onChange={e => updateRow(row.id, 'email', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-full text-sm py-1 text-slate-200 placeholder:text-slate-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => removeRow(row.id)} className="opacity-0 group-hover:opacity-100 material-symbols-outlined text-slate-600 hover:text-red-400 text-[18px] transition-opacity">close</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-indigo-500/5">
              <button onClick={addRow} className="flex items-center gap-2 text-indigo-400 text-sm font-bold hover:text-indigo-300 transition-colors mx-auto">
                <span className="material-symbols-outlined">add_circle</span>
                Add New Row
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="group relative px-12 py-4 bg-primary text-on-primary font-bold rounded-xl overflow-hidden shadow-[0_0_40px_rgba(192,193,255,0.2)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-2">
                {isSubmitting ? 'Processing...' : 'Confirm Enrollment'}
                <span className="material-symbols-outlined">{isSubmitting ? 'hourglass_top' : 'rocket_launch'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

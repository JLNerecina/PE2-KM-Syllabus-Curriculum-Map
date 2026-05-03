import { useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { Program, Department, UserRole } from '../../types';

interface Props {
  programs: Program[];
  departments: Department[];
}

export default function PreAuthorizeTab({ programs, departments }: Props) {
  const { profile } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, setRole] = useState<UserRole>('faculty');
  const [departmentId, setDepartmentId] = useState('');
  const [programId, setProgramId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredPrograms = useMemo(() => {
    if (!departmentId) return programs;
    return programs.filter(p => p.department_id === departmentId);
  }, [programs, departmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Email is required for pre-authorization.' });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('preauthorized_users').insert({
      email: email.trim(),
      role,
      name: name.trim() || null,
      id_number: idNumber.trim() || null,
      program_id: programId || null,
      department_id: departmentId || null,
      created_by: profile?.id || null,
    });

    if (error) {
      if (error.code === '23505') {
        setFeedback({ type: 'error', message: 'This email is already pre-authorized.' });
      } else {
        setFeedback({ type: 'error', message: `Failed: ${error.message}` });
      }
    } else {
      // Log single pre-authorization manually (replaces DB trigger)
      await supabase.from('audit_logs').insert({
        actor_id: profile?.id,
        action: 'preauthorize.create',
        target_table: 'preauthorized_users',
        target_id: email.trim(),
        target_label: name.trim() || email.trim(),
        changes: {
          email: { old: null, new: email.trim() },
          role: { old: null, new: role }
        },
        metadata: {
          id_number: idNumber.trim() || null,
          program_id: programId || null,
          department_id: departmentId || null
        }
      });
      setFeedback({ type: 'success', message: `Successfully pre-authorized ${email.trim()} as ${role}.` });
      setEmail(''); setName(''); setIdNumber(''); setRole('faculty'); setDepartmentId(''); setProgramId('');
    }
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-indigo-500/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-indigo-400 bg-indigo-500/10 p-2 rounded-lg">person_add</span>
            <h2 className="text-on-surface text-xl font-bold font-['Space_Grotesk']">Pre-Authorize User</h2>
          </div>
          <p className="text-sm text-slate-400">Add a faculty or admin member to the authorized login list. They will be activated upon their first Google sign-in.</p>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mx-8 mt-6 p-4 rounded-xl border text-sm flex items-center gap-3 ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
            <span className="material-symbols-outlined text-[18px]">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
            {feedback.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Email — Primary field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="faculty@cics.edu"
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
            />
            <p className="text-[11px] text-slate-500">This is the Google account email they will use to sign in.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Dr. Juan Dela Cruz"
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID Number</label>
              <input
                type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)}
                placeholder="FC-2024-001"
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</label>
            <div className="flex gap-3">
              {(['faculty', 'admin'] as UserRole[]).filter(r => {
                // Only superadmins can pre-authorize admins
                if (r === 'admin' && profile?.role !== 'superadmin') return false;
                return true;
              }).map(r => (
                <button
                  key={r} type="button" onClick={() => setRole(r)}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border ${
                    role === r
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-inner'
                      : 'bg-surface-container-high border-indigo-500/10 text-slate-400 hover:text-slate-200 hover:border-indigo-500/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</label>
            <select
              value={departmentId}
              onChange={e => { setDepartmentId(e.target.value); setProgramId(''); }}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Select Department...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
              ))}
            </select>
          </div>

          {/* Program */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Program</label>
            <select
              value={programId}
              onChange={e => setProgramId(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Select Program...</option>
              {filteredPrograms.map(p => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit" disabled={isSubmitting}
              className="w-full group relative py-4 bg-primary text-on-primary font-bold rounded-xl overflow-hidden shadow-[0_0_40px_rgba(192,193,255,0.2)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">{isSubmitting ? 'hourglass_top' : 'verified_user'}</span>
                {isSubmitting ? 'Pre-authorizing...' : 'Pre-Authorize User'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

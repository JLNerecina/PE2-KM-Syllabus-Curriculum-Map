import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { UserProfile, UserRole, Program, Department } from '../../types';

interface Props {
  programs: Program[];
  departments: Department[];
}

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-[#00a2e6]/20 text-[#89ceff]',
  faculty: 'bg-[#a482c8]/20 text-[#dbb8ff]',
  admin: 'bg-[#8083ff]/20 text-[#c0c1ff]',
  superadmin: 'bg-amber-500/20 text-amber-300',
};

const PAGE_SIZE = 8;

type StatusFilter = 'all' | 'active' | 'blocked';
const STATUS_CYCLE: StatusFilter[] = ['all', 'active', 'blocked'];
const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'All Users',
  active: 'Active Only',
  blocked: 'Blocked Only',
};
const STATUS_ICONS: Record<StatusFilter, string> = {
  all: 'group',
  active: 'check_circle',
  blocked: 'block',
};

interface EditState {
  id_number: string;
  name: string;
  role: UserRole;
  program_id: string; // Used for students
  can_edit_curriculum: boolean; // Used for faculty
  department_id: string; // Used for filtering multi-select
  overseen_programs: string[]; // Used for faculty (array of program_ids)
  is_deleted: boolean;
}

export default function UserListTab({ programs, departments }: Props) {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('name_asc');
  const [page, setPage] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  // Modal State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) setUsers(data as UserProfile[]);
    setIsLoading(false);
  }

  const filtered = useMemo(() => {
    let list = [...users];

    // Status filter
    if (statusFilter === 'active') list = list.filter(u => !u.is_deleted);
    else if (statusFilter === 'blocked') list = list.filter(u => u.is_deleted);

    // Role filter
    if (filterRole !== 'all') list = list.filter(u => u.role === filterRole);
    if (filterProgram !== 'all') list = list.filter(u => u.program_id === filterProgram);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u => {
        const prog = programs.find(p => p.id === u.program_id);
        return (
          (u.id_number || '').toLowerCase().includes(q) ||
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          (prog?.code || '').toLowerCase().includes(q)
        );
      });
    }

    const [key, dir] = sortKey.split('_');
    list.sort((a, b) => {
      let cmp = 0;
      if (key === 'name') cmp = (a.name || '').localeCompare(b.name || '');
      else if (key === 'role') cmp = a.role.localeCompare(b.role);
      else if (key === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return dir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [users, filterRole, filterProgram, sortKey, searchQuery, statusFilter, programs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageUsers = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [filterRole, filterProgram, sortKey, searchQuery, statusFilter]);

  function canEditUser(target: UserProfile): boolean {
    if (!currentUser) return false;
    if (target.id === currentUser.id) return true; // Allow editing self
    if (currentUser.role === 'superadmin') return target.role !== 'superadmin';
    if (currentUser.role === 'admin') return ['student', 'faculty'].includes(target.role);
    return false;
  }

  function getAllowedRoles(): UserRole[] {
    if (!currentUser) return [];
    if (currentUser.role === 'superadmin') return ['student', 'faculty', 'admin'];
    if (currentUser.role === 'admin') return ['student', 'faculty'];
    return [];
  }

  async function startEdit(user: UserProfile) {
    setIsModalLoading(true);
    setEditingId(user.id);
    
    let overseenPrograms: string[] = [];
    if (user.role === 'faculty') {
      const { data } = await supabase.from('faculty_overseen_programs').select('program_id').eq('faculty_id', user.id);
      if (data) {
        overseenPrograms = data.map(d => d.program_id);
      }
    }

    setEditState({
      id_number: user.id_number || '',
      name: user.name || '',
      role: user.role,
      program_id: user.program_id || '',
      can_edit_curriculum: !!user.can_edit_curriculum,
      department_id: '',
      overseen_programs: overseenPrograms,
      is_deleted: !!user.is_deleted,
    });
    setIsModalLoading(false);
  }

  function discardEdit() {
    setEditingId(null);
    setEditState(null);
  }

  async function saveEdit() {
    if (!editState || !editingId) return;
    setIsSaving(true);
    const userToEdit = users.find(u => u.id === editingId);
    
    // Build payload
    const updatePayload: Partial<UserProfile> = {
      id_number: editState.id_number || null,
      name: editState.name,
      role: editState.role,
      is_deleted: editState.is_deleted,
    };

    if (editState.role === 'student') {
      updatePayload.program_id = editState.program_id || null;
      updatePayload.can_edit_curriculum = false;
    } else if (editState.role === 'faculty') {
      updatePayload.program_id = null;
      updatePayload.can_edit_curriculum = editState.can_edit_curriculum;
    } else {
      updatePayload.program_id = null;
      updatePayload.can_edit_curriculum = false;
    }

    // 1. Update Profile
    const { error } = await supabase.from('profiles').update(updatePayload).eq('id', editingId);
    
    if (!error) {
      // 2. Sync Faculty Overseen Programs
      if (editState.role === 'faculty') {
        // Delete existing
        await supabase.from('faculty_overseen_programs').delete().eq('faculty_id', editingId);
        // Insert new
        if (editState.overseen_programs.length > 0) {
          const insertData = editState.overseen_programs.map(pid => ({
            faculty_id: editingId,
            program_id: pid,
            assigned_by: currentUser?.id
          }));
          await supabase.from('faculty_overseen_programs').insert(insertData);
        }
      } else if (userToEdit?.role === 'faculty' && editState.role !== 'faculty') {
        // Was faculty, now something else -> remove their overseen programs
        await supabase.from('faculty_overseen_programs').delete().eq('faculty_id', editingId);
      }

      // 3. Log Audit Trail
      await supabase.from('audit_logs').insert({
        actor_id: currentUser?.id,
        action: 'user.update',
        entity_type: 'user',
        entity_id: editingId,
        target_label: editState.name || userToEdit?.email || editingId,
        changes: {
          role: { old: userToEdit?.role, new: editState.role },
          name: { old: userToEdit?.name, new: editState.name },
          id_number: { old: userToEdit?.id_number, new: editState.id_number },
          is_deleted: { old: userToEdit?.is_deleted, new: editState.is_deleted },
          ...(editState.role === 'student' && { program_id: { old: userToEdit?.program_id, new: editState.program_id } }),
          ...(editState.role === 'faculty' && { can_edit_curriculum: { old: userToEdit?.can_edit_curriculum, new: editState.can_edit_curriculum } }),
        },
        metadata: {
          overseen_programs_count: editState.role === 'faculty' ? editState.overseen_programs.length : 0
        }
      });

      // Update Local State
      setUsers(prev => prev.map(u => u.id === editingId ? { ...u, ...updatePayload } : u));
    }
    
    setIsSaving(false);
    setEditingId(null);
    setEditState(null);
  }

  function getInitials(name?: string) {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  const initialsColors = ['bg-indigo-500/20 text-indigo-400', 'bg-cyan-500/20 text-cyan-400', 'bg-purple-500/20 text-purple-400', 'bg-emerald-500/20 text-emerald-400', 'bg-amber-500/20 text-amber-400'];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-indigo-500/10 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-3 relative">
            {/* Filter */}
            <div className="relative">
              <button onClick={() => { setShowFilter(!showFilter); setShowSort(false); }} className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_alt</span>
                Filter {(filterRole !== 'all' || filterProgram !== 'all') && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
              </button>
              {showFilter && (
                <div className="absolute top-full left-0 mt-2 bg-surface-container-low border border-indigo-500/20 rounded-xl p-4 shadow-2xl z-20 min-w-[240px] space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Role</label>
                    <select 
                      value={filterRole} 
                      onChange={e => {
                        const newRole = e.target.value;
                        setFilterRole(newRole);
                        if (newRole !== 'student') setFilterProgram('all');
                      }} 
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 text-sm text-slate-200 outline-none"
                    >
                      <option value="all">All Roles</option>
                      {(['student','faculty','admin','superadmin'] as UserRole[]).map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                    </select>
                  </div>
                  {filterRole === 'student' && (
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Program</label>
                      <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 text-sm text-slate-200 outline-none">
                        <option value="all">All Programs</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                      </select>
                    </div>
                  )}
                  <button onClick={() => { setFilterRole('all'); setFilterProgram('all'); setShowFilter(false); }} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Clear Filters</button>
                </div>
              )}
            </div>
            {/* Sort */}
            <div className="relative">
              <button onClick={() => { setShowSort(!showSort); setShowFilter(false); }} className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors">
                <span className="material-symbols-outlined text-[18px]">sort</span>Sort
              </button>
              {showSort && (
                <div className="absolute top-full left-0 mt-2 bg-surface-container-low border border-indigo-500/20 rounded-xl p-2 shadow-2xl z-20 min-w-[200px]">
                  {[['name_asc','Name A → Z'],['name_desc','Name Z → A'],['role_asc','Role A → Z'],['date_asc','Oldest First'],['date_desc','Newest First']].map(([k,l]) => (
                    <button key={k} onClick={() => { setSortKey(k); setShowSort(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortKey===k ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-variant/50'}`}>{l}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
  
          <div className="flex items-center gap-4">
            {/* Status Cycle Button */}
            <button
              onClick={() => {
                const idx = STATUS_CYCLE.indexOf(statusFilter);
                setStatusFilter(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
              }}
              className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">{STATUS_ICONS[statusFilter]}</span>
              {STATUS_LABELS[statusFilter]}
            </button>
            <span className="text-xs text-slate-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
  
        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-indigo-500/10">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              type="search"
              placeholder="Search by name, ID, email, role, or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-variant/30 border border-indigo-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>
        </div>
  
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 text-indigo-300 text-[11px] uppercase tracking-widest">
                <th className="px-6 py-4 border-b border-indigo-500/10">ID</th>
                <th className="px-6 py-4 border-b border-indigo-500/10">Full Name</th>
                <th className="px-6 py-4 border-b border-indigo-500/10">Email Address</th>
                <th className="px-6 py-4 border-b border-indigo-500/10">Role</th>
                <th className="px-6 py-4 border-b border-indigo-500/10 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-500/10">
              {pageUsers.map((u, i) => {
                const colorClass = initialsColors[(page * PAGE_SIZE + i) % initialsColors.length];
                
                return (
                  <tr key={u.id} className={`transition-colors hover:bg-indigo-500/5`}>
                    <td className="px-6 py-5 text-sm text-slate-400 font-mono">
                      {u.id_number || '—'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold`}>{getInitials(u.name)}</div>
                        <span className="font-medium text-on-surface">{u.name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{u.email}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 ${ROLE_COLORS[u.role]} rounded-full text-xs font-bold uppercase tracking-wider`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canEditUser(u) ? (
                          <button
                            onClick={() => startEdit(u)}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 flex items-center gap-2 mx-auto"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Edit
                          </button>
                        ) : (
                          <div className="relative group inline-block">
                            <button disabled className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700/30 border border-slate-700/50 text-slate-500 cursor-not-allowed">
                              Edit
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 z-10">
                              Insufficient permissions
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageUsers.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-500">No users match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
  
        {/* Pagination */}
        <div className="p-4 border-t border-indigo-500/10 flex items-center justify-between">
          <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && editState && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-indigo-500/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-indigo-500/10 flex justify-between items-center bg-surface-container-high/50">
              <h3 className="text-xl font-bold text-on-surface font-['Space_Grotesk'] flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-400">edit_square</span>
                Edit User Profile
              </h3>
              <button onClick={discardEdit} className="text-slate-400 hover:text-red-400 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {isModalLoading ? (
                 <div className="flex justify-center py-10">
                   <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                 </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">ID Number</label>
                      <input
                        type="text"
                        value={editState.id_number}
                        onChange={e => setEditState({ ...editState, id_number: e.target.value })}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                        placeholder="2024-XXXX"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Role</label>
                      <select
                        value={editState.role}
                        disabled={editingId === currentUser?.id}
                        onChange={e => setEditState({ ...editState, role: e.target.value as UserRole })}
                        className={`w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 ${editingId === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {editingId === currentUser?.id ? (
                          <option value={editState.role}>{editState.role.charAt(0).toUpperCase() + editState.role.slice(1)}</option>
                        ) : (
                          getAllowedRoles().map(r => (
                            <option key={r} value={r} className="bg-slate-900">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>



                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editState.name}
                      onChange={e => setEditState({ ...editState, name: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                      placeholder="Juan Dela Cruz"
                    />
                  </div>

                  {editState.role === 'student' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Academic Program</label>
                      <select
                        value={editState.program_id}
                        onChange={e => setEditState({ ...editState, program_id: e.target.value })}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                      >
                        <option value="" className="bg-slate-900">Not Assigned</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-900">{p.code} - {p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {editState.role === 'faculty' && (
                    <div className="space-y-6 pt-2 border-t border-indigo-500/10">
                      <div className="flex items-center justify-between bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                        <div>
                          <h4 className="text-sm font-bold text-indigo-300">Curriculum Editor Access</h4>
                          <p className="text-xs text-slate-400 mt-1">Allow this faculty to modify curriculum maps.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editState.can_edit_curriculum}
                            onChange={() => setEditState({ ...editState, can_edit_curriculum: !editState.can_edit_curriculum })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-indigo-300 mb-1">Overseen Programs</h4>
                          <p className="text-xs text-slate-400">Select programs this faculty member can monitor.</p>
                        </div>

                        {/* Multi-select filter */}
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editState.department_id}
                            onChange={e => setEditState({ ...editState, department_id: e.target.value })}
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                          >
                            <option value="">All Departments</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id} className="bg-slate-900">{d.code}</option>
                            ))}
                          </select>
                          <select
                            value=""
                            onChange={e => {
                              if (e.target.value && !editState.overseen_programs.includes(e.target.value)) {
                                setEditState({ ...editState, overseen_programs: [...editState.overseen_programs, e.target.value] });
                              }
                            }}
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                          >
                            <option value="" disabled>+ Add Program</option>
                            {programs
                              .filter(p => !editState.department_id || p.department_id === editState.department_id)
                              .filter(p => !editState.overseen_programs.includes(p.id))
                              .map(p => (
                                <option key={p.id} value={p.id} className="bg-slate-900">{p.code}</option>
                            ))}
                          </select>
                        </div>

                        {/* Tags */}
                        {editState.overseen_programs.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {editState.overseen_programs.map(pid => {
                              const prog = programs.find(p => p.id === pid);
                              return (
                                <span key={pid} className="inline-flex items-center gap-1 px-3 py-1 bg-surface-bright border border-indigo-500/20 text-indigo-300 text-xs rounded-full">
                                  {prog?.code || 'Unknown'}
                                  <button
                                    onClick={() => setEditState({ ...editState, overseen_programs: editState.overseen_programs.filter(id => id !== pid) })}
                                    className="hover:text-red-400 hover:bg-red-500/10 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[12px]">close</span>
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-surface-container-lowest border border-dashed border-outline-variant/20 rounded-xl">
                            <span className="text-xs text-slate-500">No programs assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Block/Unblock Status */}
                  <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 mt-6">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${editState.is_deleted ? 'text-red-400' : 'text-emerald-400'}`}>
                        {editState.is_deleted ? 'block' : 'check_circle'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">Account Status</h4>
                        <p className="text-xs text-slate-400">{editState.is_deleted ? 'This user is currently blocked from signing in.' : 'This account is active and can access the system.'}</p>
                      </div>
                    </div>
                    {/* Only superadmins can block other admins, and admins can only block students/faculty. Same logic as canToggle from previous versions. */}
                    {((currentUser?.role === 'superadmin' && editingId !== currentUser.id) || 
                      (currentUser?.role === 'admin' && ['student', 'faculty'].includes(editState.role))) ? (
                      <button
                        onClick={() => setEditState({ ...editState, is_deleted: !editState.is_deleted })}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                          editState.is_deleted
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {editState.is_deleted ? 'Unblock' : 'Block'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Locked</span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-indigo-500/10 bg-surface-container-high/30 flex justify-end gap-3">
              <button
                onClick={discardEdit}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-surface-bright transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={isSaving || isModalLoading}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

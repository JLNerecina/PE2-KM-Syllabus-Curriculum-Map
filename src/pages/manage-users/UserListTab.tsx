import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { UserProfile, UserRole, Program } from '../../types';

interface Props {
  programs: Program[];
}

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-[#00a2e6]/20 text-[#89ceff]',
  faculty: 'bg-[#a482c8]/20 text-[#dbb8ff]',
  admin: 'bg-[#8083ff]/20 text-[#c0c1ff]',
  superadmin: 'bg-amber-500/20 text-amber-300',
};

const PAGE_SIZE = 8;

export default function UserListTab({ programs }: Props) {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('name_asc');
  const [page, setPage] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
    if (filterRole !== 'all') list = list.filter(u => u.role === filterRole);
    if (filterProgram !== 'all') list = list.filter(u => u.program_id === filterProgram);

    const [key, dir] = sortKey.split('_');
    list.sort((a, b) => {
      let cmp = 0;
      if (key === 'name') cmp = (a.name || '').localeCompare(b.name || '');
      else if (key === 'role') cmp = a.role.localeCompare(b.role);
      else if (key === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return dir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [users, filterRole, filterProgram, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageUsers = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [filterRole, filterProgram, sortKey]);

  async function toggleSoftDelete(user: UserProfile) {
    setTogglingId(user.id);
    const { error } = await supabase.from('profiles').update({ is_deleted: !user.is_deleted }).eq('id', user.id);
    if (!error) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_deleted: !u.is_deleted } : u));
    setTogglingId(null);
  }

  function canToggle(target: UserProfile): boolean {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin') return target.id !== currentUser.id;
    if (currentUser.role === 'admin') return ['student', 'faculty'].includes(target.role);
    return false;
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
        <span className="text-xs text-slate-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/50 text-indigo-300 text-[11px] uppercase tracking-widest">
              <th className="px-8 py-4 border-b border-indigo-500/10">ID</th>
              <th className="px-8 py-4 border-b border-indigo-500/10">Full Name</th>
              <th className="px-8 py-4 border-b border-indigo-500/10">Email Address</th>
              <th className="px-8 py-4 border-b border-indigo-500/10">Role</th>
              <th className="px-8 py-4 border-b border-indigo-500/10">Program</th>
              <th className="px-8 py-4 border-b border-indigo-500/10">Status</th>
              <th className="px-8 py-4 border-b border-indigo-500/10 text-center">Soft Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-500/10">
            {pageUsers.map((u, i) => {
              const colorClass = initialsColors[(page * PAGE_SIZE + i) % initialsColors.length];
              const prog = programs.find(p => p.id === u.program_id);
              return (
                <tr key={u.id} className="hover:bg-indigo-500/5 transition-colors">
                  <td className="px-8 py-5 text-sm text-slate-400 font-mono">{u.id_number || '—'}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold`}>{getInitials(u.name)}</div>
                      <span className="font-medium text-on-surface">{u.name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">{u.email}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 ${ROLE_COLORS[u.role]} rounded-full text-xs font-bold uppercase tracking-wider`}>{u.role}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400">{prog?.code || '—'}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${u.is_deleted ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                      <span className={`text-xs ${u.is_deleted ? 'text-red-400/80' : 'text-emerald-400/80'}`}>{u.is_deleted ? 'Deleted' : 'Active'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {canToggle(u) ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!u.is_deleted}
                          disabled={togglingId === u.id}
                          onChange={() => toggleSoftDelete(u)}
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    ) : (
                      <div className="relative group inline-block">
                        <div className="w-11 h-6 bg-slate-700/50 rounded-full relative opacity-40 cursor-not-allowed">
                          <div className={`absolute top-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 ${!u.is_deleted ? 'left-[22px]' : 'left-[2px]'}`}></div>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
                          {currentUser?.id === u.id ? 'Cannot modify yourself' : 'Insufficient permissions'}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {pageUsers.length === 0 && (
              <tr><td colSpan={7} className="px-8 py-12 text-center text-slate-500">No users match your filters.</td></tr>
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
  );
}

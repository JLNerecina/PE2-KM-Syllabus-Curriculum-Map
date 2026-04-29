import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RootLayout = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Tracker', path: '/tracker', icon: 'account_tree' },
    { name: 'Map', path: '/map', icon: 'dashboard' },
  ];

  return (
    <div className="flex flex-col bg-[#0b1326] text-[#dae2fd] font-sans min-h-screen selection:bg-[#c0c1ff]/30">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-slate-950/80 backdrop-blur-lg border-b border-indigo-500/20 shadow-lg shadow-indigo-500/5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center border border-indigo-500/30">
                <span className="material-symbols-outlined text-indigo-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
             </div>
             <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent font-['Space_Grotesk'] tracking-wider hidden sm:block">
                CICS PORTAL
             </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-500/15 text-indigo-400 font-bold shadow-inner border border-indigo-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-indigo-500/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>
                    {item.icon}
                  </span>
                  <span className="font-['Space_Grotesk'] text-sm tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={signOut}
              className="p-2 rounded-full hover:bg-red-500/10 transition-colors duration-200 text-slate-400 hover:text-red-400 flex items-center justify-center"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mt-16 flex-1 bg-[#0b1326] min-h-[calc(100vh-64px)] overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

import { Link, Outlet } from 'react-router-dom';

export const RootLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Branding */}
        <div className="p-6">
          <h1 className="text-xl font-medium tracking-tight text-gray-800">K-SYSTEM</h1>
          <p className="text-xs text-gray-400 mt-1">V1.0.4</p>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6">
          <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <span>+</span> New Node
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto w-full">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/" 
                className="w-full flex items-center px-6 py-3 bg-gray-200 border-l-4 border-gray-800 text-gray-900 font-medium text-sm"
              >
                <div className="w-5 h-5 mr-3 bg-gray-400 rounded-sm opacity-50 flex items-center justify-center text-[10px] text-white">i</div>
                Knowledge Map
              </Link>
            </li>
            {/* Inactive Placeholders */}
            {[
              { name: 'Nodes', icon: '⚄' },
              { name: 'Connections', icon: '☍' },
              { name: 'Atlas', icon: '🗺' },
              { name: 'Settings', icon: '⚙' },
            ].map((item) => (
              <li key={item.name}>
                <div className="w-full flex items-center px-6 py-3 text-gray-500 font-medium text-sm cursor-not-allowed border-l-4 border-transparent hover:bg-gray-100 transition-colors">
                  <div className="w-5 h-5 mr-3 flex items-center justify-center text-lg">{item.icon}</div>
                  {item.name}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-200">
          <ul className="space-y-2">
            <li>
              <div className="flex items-center px-2 py-2 text-gray-500 text-sm cursor-not-allowed hover:text-gray-700">
                <span className="w-5 h-5 mr-3 flex justify-center text-base">?</span> Help
              </div>
            </li>
            <li>
              <div className="flex items-center px-2 py-2 text-gray-500 text-sm cursor-not-allowed hover:text-gray-700">
                <span className="w-5 h-5 mr-3 flex justify-center text-base">⎋</span> Logout
              </div>
            </li>
          </ul>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* TOP HEADER */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-8 flex-1">
            <h2 className="font-bold tracking-wider text-gray-800">MAP_VIEWER</h2>
            
            {/* Search Bar */}
            <div className="max-w-md w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">🔍</span>
              </div>
              <input
                type="text"
                placeholder="SEARCH_BOX"
                className="w-full bg-gray-50 border border-transparent text-gray-900 text-sm rounded-md pl-10 px-4 py-2 focus:bg-white focus:border-gray-300 focus:outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              🔔
            </button>
            <button className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              ⏱
            </button>
            <button className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 border border-gray-300">
              👤
            </button>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <main className="flex-1 overflow-auto bg-gray-50/30 p-8">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

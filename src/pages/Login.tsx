import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        // Open the Google Auth URL in a popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        window.open(
          data.url, 
          'google-login-popup', 
          `width=${width},height=${height},left=${left},top=${top}`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Cosmic Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary-container/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-tertiary-container/10 blur-[100px] rounded-full"></div>
        {/* Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-xwlvrHCBVZ6yvaaQirDI2UcJDrRNyToEwBuN854_AscnpklZ9JqybP0oKl4Chvn3e1hzJfLrAIamGfifvq7X-LvjtJPanuONOcjbtFM7wC9qhMqHVvHJaha1wcIxvLo1Vl39XdsxugctpwgYIdQUQU3Eez7VPuuKuj8mFqsx9YkFPmnizdoBYDy5XgS0soCr1qCbZMfW298lW-yqdy-7hXg8isB3iO72k-NXHqoX_Pbn6vdf1hcN2cPZZhtACWfIgFQgw1Tqqys')" }}
        ></div>
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-md px-margin-mobile">
        {/* Error Toast */}
        {error && (
          <div className="absolute -top-24 left-0 right-0 animate-bounce">
            <div className="bg-error-container border border-error/30 text-on-error-container px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="font-label-md text-label-md">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-surface-container/60 backdrop-blur-xl border border-outline-variant/30 rounded-3xl p-10 shadow-2xl shadow-black/50 overflow-hidden relative group">
          {/* Glass Inner Shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* University Logo */}
            <div className="mb-stack-md relative">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-primary text-4xl" data-weight="fill">school</span>
              </div>
              <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-50 rounded-full"></div>
            </div>

            {/* Title & Branding */}
            <div className="text-center mb-stack-lg">
              <h1 className="font-headline-xl text-headline-md mb-2 bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                CICS Curriculum Map
              </h1>
              <p className="font-body-md text-on-surface-variant max-w-[280px] mx-auto">
                Academic Portal for Information and Computing Sciences
              </p>
            </div>

            {/* Action Button */}
            <div className="w-full space-y-stack-md">
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-primary-container to-secondary-container text-white font-label-md text-label-md py-4 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(128,131,255,0.4)] hover:brightness-110 transition-all duration-300 group/btn active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                  </svg>
                )}
                {isLoading ? 'Opening popup...' : 'Sign in with Google'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <footer className="mt-stack-md text-center">
          <p className="font-body-md text-on-surface-variant/60 text-xs flex items-center justify-center gap-1">
            Made with <span className="material-symbols-outlined text-primary text-[10px]" data-weight="fill">auto_awesome</span> by University Research Center
          </p>
        </footer>
      </main>

      {/* Floating Sparkles (Decorative) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[15%] w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-[40%] right-[10%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[30%] left-[25%] w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[10%] right-[20%] w-1 h-1 bg-secondary-container rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
}

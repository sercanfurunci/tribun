import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Ambient atmosphere — fills negative space on ultra-wide screens */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px 600px at 15% -10%, rgba(22,163,74,0.10), transparent 60%),' +
            'radial-gradient(700px 500px at 90% 110%, rgba(22,163,74,0.06), transparent 60%)',
        }}
      />
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1600px] flex-col overflow-hidden rounded-[28px] border border-white/8 bg-navy-950/50 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur-[18px] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] sm:rounded-[32px]">
        <Navbar />
        <main className="flex-1 px-4 py-6 pb-32 sm:px-6 sm:py-8 lg:px-8 lg:py-10 md:pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

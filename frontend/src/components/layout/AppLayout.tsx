import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
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
      <Navbar />
      <main className="mx-auto w-full max-w-[1500px] px-6 py-8 sm:py-12 pb-32 md:pb-16">
        <Outlet />
      </main>
    </div>
  );
}

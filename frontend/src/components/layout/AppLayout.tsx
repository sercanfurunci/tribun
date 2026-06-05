import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-4 py-6 pb-20 sm:px-6 sm:py-8 sm:pb-8 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}

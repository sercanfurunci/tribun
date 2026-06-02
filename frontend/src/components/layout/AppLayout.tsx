import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 py-8 sm:py-12 pb-32 md:pb-16">
        <Outlet />
      </main>
    </div>
  );
}

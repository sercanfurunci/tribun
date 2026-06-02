import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-5 sm:px-7 lg:px-10 py-6 sm:py-8 pb-28 md:pb-12">
        <Outlet />
      </main>
    </div>
  );
}

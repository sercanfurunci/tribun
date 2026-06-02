import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main
        className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-8 sm:py-12 pb-28 md:pb-16"
      >
        <Outlet />
      </main>
    </div>
  );
}

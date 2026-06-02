import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main
        className="w-full px-6 sm:px-8 lg:px-12 py-8 sm:py-10 pb-28 md:pb-14"
        style={{ maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="py-6 text-center">
        <p className="text-xs text-slate-700 font-heading tracking-widest uppercase">
          Tribün &copy; {new Date().getFullYear()} — Football Prediction League
        </p>
      </footer>
    </div>
  );
}

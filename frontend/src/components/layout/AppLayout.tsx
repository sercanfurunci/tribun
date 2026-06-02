import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-600">
        Tribün &copy; {new Date().getFullYear()} — Football Prediction League
      </footer>
    </div>
  );
}

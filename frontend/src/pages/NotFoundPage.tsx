import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-black text-slate-800 mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

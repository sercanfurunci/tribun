import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center p-4">
      <div className="text-center">
        <p className="font-display text-[10rem] leading-none text-[#E8E4DE] mb-4 select-none">404</p>
        <h1 className="font-heading font-black text-2xl text-[#111111] mb-2">Sayfa bulunamadı</h1>
        <p className="text-[#666666] text-sm mb-8">Aradığınız sayfa mevcut değil.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-white bg-[#8B1E1E] hover:bg-[#6F1717] border border-[#8B1E1E] transition-colors duration-150"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}

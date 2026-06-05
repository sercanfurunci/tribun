import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { useLanguageStore, useT } from '../../store/language';
import { Icon, type IconName } from '../ui/Icon';

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { lang, toggle } = useLanguageStore();
  const t = useT();
  const navigate = useNavigate();

  const NAV_LINKS: { to: string; label: string; icon: IconName }[] = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: 'zap' },
    { to: '/matches', label: t('nav.matches'), icon: 'ball' },
    { to: '/predictions', label: t('nav.predictions'), icon: 'target' },
    { to: '/standings', label: t('nav.standings'), icon: 'trophy' },
    { to: '/leagues', label: t('nav.leagues'), icon: 'medal' },
  ];

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#D9D4CC]">
        <div className="mx-auto flex h-[52px] max-w-[1280px] items-stretch px-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
            className="flex items-center mr-8 shrink-0 font-heading font-black text-[15px] tracking-[0.12em] uppercase text-[#111111] hover:text-[#8B1E1E] transition-colors duration-150"
          >
            TRİBÜN
          </Link>

          <nav className="hidden lg:flex items-stretch flex-1 gap-0">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-3 text-[13px] font-medium border-b-2 transition-colors duration-150 ${
                    isActive
                      ? 'text-[#8B1E1E] border-[#8B1E1E]'
                      : 'text-[#666666] border-transparent hover:text-[#111111]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              onClick={toggle}
              aria-label="Toggle language"
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-[0.08em] border border-[#D9D4CC] hover:border-[#B8B2AA] transition-colors duration-150"
            >
              <span className={lang === 'tr' ? 'text-[#8B1E1E]' : 'text-[#666666]'}>TR</span>
              <span className="text-[#D9D4CC]">/</span>
              <span className={lang === 'en' ? 'text-[#8B1E1E]' : 'text-[#666666]'}>EN</span>
            </button>

            {isAuthenticated && (
              <>
                {/* Mobile: avatar only → /profile */}
                <Link
                  to="/profile"
                  className="sm:hidden flex items-center justify-center"
                  aria-label="Profile"
                >
                  <div className="size-7 rounded-full bg-[#8B1E1E] flex items-center justify-center text-white text-[10px] font-bold font-heading">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                </Link>

                {/* Desktop: avatar + username + logout */}
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded text-[13px] font-medium text-[#666666] hover:text-[#111111] hover:bg-[#F2EFE9] transition-colors duration-150"
                >
                  <div className="size-6 rounded-full bg-[#8B1E1E] flex items-center justify-center text-white text-[10px] font-bold font-heading shrink-0">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium text-[#666666] hover:text-[#C1121F] hover:bg-[#FEF2F2] transition-colors duration-150"
                >
                  <Icon name="log-out" size={14} />
                  <span className="hidden lg:inline">{t('nav.logout')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#D9D4CC] h-14">
        <div className="grid grid-cols-5 h-full">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-[0.04em] uppercase transition-colors duration-150 ${
                  isActive ? 'text-[#8B1E1E]' : 'text-[#999390] hover:text-[#111111]'
                }`
              }
            >
              <Icon name={icon} size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

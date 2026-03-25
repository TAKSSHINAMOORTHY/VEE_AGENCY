import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, User, BarChart3, Menu, X, Settings, BookOpenText, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/business', label: 'Business', icon: Briefcase },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/ledger', label: 'Ledger', icon: BookOpenText },
  { to: '/personal', label: 'Personal', icon: User },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const quickNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/business', label: 'Business', icon: Briefcase },
  { to: '/personal', label: 'Personal', icon: User },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const applyPadding = () => {
      const shouldPad = window.matchMedia('(max-width: 767px)').matches;
      document.body.style.paddingBottom = shouldPad ? '88px' : '';
    };

    applyPadding();
    window.addEventListener('resize', applyPadding);
    return () => {
      window.removeEventListener('resize', applyPadding);
      document.body.style.paddingBottom = '';
    };
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">VA</span>
              </div>
              <span className="font-semibold text-foreground text-lg hidden sm:block">
                Vee Agency
              </span>
            </div>

            {/* Desktop Quick Navigation (Instagram-inspired icon-first) */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1">
              {quickNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    aria-label={item.label}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
                      'hover:scale-105 hover:bg-accent',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn('w-5 h-5', isActive ? 'stroke-[2.5px]' : 'stroke-[2px]')} />
                  </NavLink>
                );
              })}
            </div>

            {/* Hamburger Menu Button (kept intact) */}
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>

          {/* Full Route Menu (includes Companies and Ledger unchanged) */}
          {mobileOpen && (
            <div className="py-4 border-t border-border">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Quick Navigation (Instagram-inspired bottom bar) */}
      <nav
        aria-label="Quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85"
      >
        <div className="grid grid-cols-5 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {quickNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-all duration-200',
                  'hover:scale-[1.03] active:scale-95',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/70'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive ? 'stroke-[2.5px]' : 'stroke-[2px]')} />
                <span className="text-[10px] leading-none font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Store, Puzzle, Sprout, Droplets, LogOut, Moon, Sun, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useSettingsStore } from '@/hooks/useStore';
import AIAssistant from '@/components/AIAssistant';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, lang, setTheme, setLang } = useSettingsStore();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Store, label: 'Marketplace', path: '/marketplace' },
    { icon: Puzzle, label: 'My Tools', path: '/my-plugins' },
    { icon: Droplets, label: 'Smart Irrigation', path: '/smart-irrigation' },
    { icon: Sprout, label: 'Livestock', path: '/livestock' },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // Apply theme and language direction
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [theme, lang]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed h-screen">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-sidebar-primary" />
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">FarmHub</h1>
              <p className="text-xs text-muted-foreground">من الأرض إلى السوق</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              variant="ghost"
              className="flex items-center gap-2 w-[48%] justify-start hover:bg-sidebar-accent"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="text-sm text-sidebar-foreground">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </Button>
            <Button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              variant="ghost"
              className="flex items-center gap-2 w-[48%] justify-start hover:bg-sidebar-accent"
            >
              <Languages className="h-5 w-5" />
              <span className="text-sm text-sidebar-foreground">{lang === 'ar' ? 'English' : 'العربية'}</span>
            </Button>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="flex items-center gap-2 w-full justify-start hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5 text-sidebar-primary" />
            <span className="text-sm text-sidebar-foreground">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto ml-64">
        {children}
        <AIAssistant />
      </main>
    </div>
  );
};

export default Layout;

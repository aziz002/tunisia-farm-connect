import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsStore } from '@/hooks/useStore';
import AIAssistant from '@/components/AIAssistant';
import AppSidebar from '@/components/AppSidebar';
import CommandMenu from '@/components/CommandMenu';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, lang, setTheme, setLang } = useSettingsStore();

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
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <AppSidebar />
        <SidebarInset>
          {/* Top bar */}
          <header className="sticky top-0 z-10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center gap-2 px-4 h-14">
              <SidebarTrigger />
              <Button variant="ghost" size="icon" aria-label="Go back" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="mx-2 h-6" />
              <div className="relative w-full max-w-md">
                <Input placeholder="Search (Ctrl+K)…" className="pl-8" aria-label="Search" />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1">
            {children}
          </div>
          <AIAssistant />
          <CommandMenu />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;

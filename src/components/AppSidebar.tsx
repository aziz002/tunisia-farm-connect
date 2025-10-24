import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePluginStore, useSettingsStore } from '@/hooks/useStore';
import { builtInModules } from '@/lib/plugins';
import { cn } from '@/lib/utils';
import {
  Home,
  Store,
  Puzzle,
  Droplets,
  Sprout,
  Beef,
  Settings,
  Languages,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useMemo } from 'react';

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const { theme, lang, setTheme, setLang } = useSettingsStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { pinnedModules } = usePluginStore();

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard: Home,
    Droplets,
    Beef,
    Store,
    Puzzle,
  };

  const navItems = useMemo(
    () => [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Droplets, label: 'Smart Irrigation', path: '/smart-irrigation' },
      { icon: Sprout, label: 'Livestock', path: '/livestock' },
      { icon: Store, label: 'Tools Marketplace', path: '/marketplace', badge: '12' },
      { icon: Store, label: 'Crops Market', path: '/crops-market' },
      { icon: Puzzle, label: 'My Tools', path: '/my-plugins' },
    ],
    [],
  );

  const isActive = (path: string) => {
    if (path.includes('#')) return location.pathname + location.hash === path;
    return location.pathname === path;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-1.5 flex items-center gap-2">
          <Droplets className="h-6 w-6 text-sidebar-primary" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">FarmHub</div>
            <div className="text-[10px] text-muted-foreground">From soil to market</div>
          </div>
        </div>
        <SidebarInput placeholder="Search…" aria-label="Search" />
      </SidebarHeader>

      <SidebarContent>
        {/* Pinned tools */}
        {Object.values(pinnedModules).some(Boolean) && (
          <SidebarGroup>
            <SidebarGroupLabel>Pinned</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {builtInModules
                  .filter((m) => pinnedModules[m.id])
                  .map((m) => {
                    const Icon = iconMap[m.icon] || Puzzle;
                    return (
                      <SidebarMenuItem key={`pin-${m.id}`}>
                        <SidebarMenuButton asChild isActive={isActive(m.route)} tooltip={m.name}>
                          <Link to={m.route}>
                            <Icon className="h-4 w-4" /> <span>{m.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* My Business */}
        <SidebarGroup>
          <SidebarGroupLabel>My Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[{ icon: Home, label: 'Dashboard', path: '/dashboard' }, { icon: Store, label: 'Sales Dashboard', path: '/marketplace-seller' }, { icon: Droplets, label: 'Smart Irrigation', path: '/smart-irrigation' }, { icon: Sprout, label: 'Livestock', path: '/livestock' }].map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Open Marketplace">
                  <button onClick={() => navigate('/marketplace')}>
                    <Store className="h-4 w-4" /> <span>Explore Tools</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Tools">
                  <button onClick={() => navigate('/my-plugins')}>
                    <Puzzle className="h-4 w-4" /> <span>Manage Tools</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Help</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Docs">
                  <a href="https://example.com/docs" target="_blank" rel="noreferrer">
                    <Home className="h-4 w-4" /> <span>Documentation</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 flex items-center justify-between gap-2">
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant="ghost"
            className="h-8 px-2 gap-2 justify-start flex-1"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="text-xs">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
          </Button>
          <Button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            variant="ghost"
            className="h-8 px-2 gap-2 justify-start"
          >
            <Languages className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-2">
          <Button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            variant="ghost"
            className={cn('w-full justify-start gap-2')}
          >
            <LogOut className="h-4 w-4 text-sidebar-primary" />
            <span className="text-xs">Sign out{user?.name ? ` (${user.name})` : ''}</span>
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

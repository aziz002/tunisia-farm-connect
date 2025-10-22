import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, Puzzle, Sprout, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Store, label: 'Marketplace', path: '/marketplace' },
    { icon: Puzzle, label: 'My Plugins', path: '/my-plugins' },
    { icon: Sprout, label: 'Livestock', path: '/livestock' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-sidebar-primary" />
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">FarmHub</h1>
              <p className="text-xs text-muted-foreground">من الأرض إلى السوق</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3">
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

        <div className="p-4 border-t border-sidebar-border">
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
            <MessageCircle className="h-5 w-5 text-sidebar-primary" />
            <span className="text-sm text-sidebar-foreground">AI Assistant</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;

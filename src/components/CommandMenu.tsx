import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Droplets, Home, Puzzle, Store, Sun, Moon, Languages, Rocket, Search, ShoppingBag } from 'lucide-react';
import { useSettingsStore, useUIStore } from '@/hooks/useStore';

export default function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLang } = useSettingsStore();
  const { dispatchAction } = useUIStore();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} label="Global actions">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(() => navigate('/dashboard'))}>
            <Home className="mr-2 h-4 w-4" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/marketplace-seller'))}>
            <Store className="mr-2 h-4 w-4" /> Sales Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/smart-irrigation'))}>
            <Droplets className="mr-2 h-4 w-4" /> Smart Irrigation
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/marketplace'))}>
            <Store className="mr-2 h-4 w-4" /> Explore Tools
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/crops-market'))}>
            <ShoppingBag className="mr-2 h-4 w-4" /> Crops Market
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/my-plugins'))}>
            <Puzzle className="mr-2 h-4 w-4" /> My Tools
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => run(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} Toggle theme
          </CommandItem>
          <CommandItem onSelect={() => run(() => setLang(lang === 'ar' ? 'en' : 'ar'))}>
            <Languages className="mr-2 h-4 w-4" /> Switch language
          </CommandItem>
          <CommandItem onSelect={() => run(() => dispatchAction('openScheduleEditor'))}>
            <Rocket className="mr-2 h-4 w-4" /> Open schedule editor
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Search">
          <CommandItem onSelect={() => run(() => navigate('/marketplace'))}>
            <Search className="mr-2 h-4 w-4" /> Search marketplace
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

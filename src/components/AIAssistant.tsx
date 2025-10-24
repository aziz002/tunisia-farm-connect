import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Rocket, User, Bot, Map, Droplets, Store } from 'lucide-react';
import { Api } from '@/lib/api';
import { mockAssistant } from '@/lib/aiAssistant';
import { builtInModules } from '@/lib/plugins';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore, useUIStore } from '@/hooks/useStore';

type Msg = { role: 'user' | 'assistant'; text: string };

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [agentic, setAgentic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', text: 'Hi! I can summarize your farm metrics, recommend modules, and surface alerts. What would you like to do?' },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { dispatchAction } = useUIStore();
  const { setTheme, setLang } = useSettingsStore();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const suggestions = useMemo(
    () => [
      { label: 'Summarize metrics', text: 'Summarize my latest farm metrics.' },
      { label: 'Recommend modules', text: 'Based on my farm, what modules should I enable?' },
      { label: 'Show alerts', text: 'Do I have any AI alerts today?' },
      { label: 'Optimize irrigation', text: 'How can I optimize irrigation today?' },
    ],
    []
  );

  async function handleSubmit(prompt?: string) {
    const content = (prompt ?? input).trim();
    if (!content) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: content }]);
    setBusy(true);
    try {
      const metrics = await Api.getLatestMetrics();
      let reply = '';

      const lc = content.toLowerCase();
      // Agentic intents
      if (agentic && (lc.includes('add sensor') || lc.includes('new sensor')) && (lc.includes('irrigation') || lc.includes('smart irrigation') || lc.includes('water'))) {
        reply = 'Opening Smart Irrigation → Add Sensor for you...';
        // Keep chat open; navigate and trigger UI action
        navigate('/smart-irrigation');
        // Delay to ensure page mount is not required; SmartIrrigation will pick up the action whenever it is ready
        setTimeout(() => dispatchAction('openAddSensor'), 50);
        setMessages((m) => [...m, { role: 'assistant', text: reply }]);
        setBusy(false);
        return;
      }

      if (lc.includes('toggle theme') || lc.includes('dark mode') || lc.includes('light mode')) {
        const makeDark = lc.includes('dark');
        setTheme(makeDark ? 'dark' : 'light');
        reply = `Switched theme to ${makeDark ? 'dark' : 'light'} mode.`;
      } else if (lc.includes('language') || lc.includes('arabic') || lc.includes('english')) {
        const toAr = lc.includes('arabic') || lc.includes('ar');
        setLang(toAr ? 'ar' : 'en');
        reply = `Language set to ${toAr ? 'العربية' : 'English'}.`;
      } else if (lc.includes('schedule') && (lc.includes('edit') || lc.includes('editor') || lc.includes('open'))) {
        reply = 'Opening the schedule editor…';
        navigate('/smart-irrigation');
        setTimeout(() => dispatchAction('openScheduleEditor'), 50);
      } else if (lc.includes('summarize') || lc.includes('summary')) {
        reply = await mockAssistant.summarizeFarmData(metrics);
      } else if (lc.includes('recommend')) {
        const modules = builtInModules.map(({ component, ...meta }) => meta);
        const recs = await mockAssistant.recommendModules(metrics, modules);
        reply = recs.length
          ? `I recommend enabling: ${recs.map((r) => r.name).join(', ')}.`
          : 'No additional modules recommended right now.';
      } else if (lc.includes('alert')) {
        const aiAlerts = await mockAssistant.generateAlerts(metrics);
        reply = aiAlerts.length
          ? aiAlerts.map((a) => `• ${a.message}${a.action ? ` — ${a.action}` : ''}`).join('\n')
          : 'No AI alerts at the moment.';
      } else if (lc.includes('irrigation')) {
        reply = 'I can analyze soil moisture and propose a water schedule: try scheduling Section B for 40 minutes at 14:30. (Agentic mode can auto-draft this.)';
      } else {
        reply = "I can help with metrics, module recommendations, and alerts. Try 'Summarize metrics' or 'Recommend modules'.";
      }

      if (agentic) {
        reply += '\n\nAgentic mode: I can draft actions (e.g., enable modules, propose irrigation schedule). Confirm to apply.';
      }
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: `I hit an issue reading tools: ${message}` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher FAB */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="lg" className="fixed bottom-6 right-6 z-40 shadow-lg gap-2" variant="default">
            <MessageSquare className="h-5 w-5" />
            Assistant
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[90vw] max-w-xl p-0 flex flex-col">
          <div className="p-4 border-b bg-card/60">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" /> Farm Assistant
              </SheetTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Agentic mode</span>
                <Switch checked={agentic} onCheckedChange={setAgentic} />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" className="gap-2" onClick={() => { navigate('/dashboard'); setOpen(true); }}><Map className="h-4 w-4"/> Dashboard</Button>
              <Button size="sm" variant="secondary" className="gap-2" onClick={() => { navigate('/smart-irrigation'); setOpen(true); }}><Droplets className="h-4 w-4"/> Smart Irrigation</Button>
              <Button size="sm" variant="secondary" className="gap-2" onClick={() => { navigate('/marketplace'); setOpen(true); }}><Store className="h-4 w-4"/> Marketplace</Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${m.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${m.role === 'assistant' ? 'bg-primary/15 text-primary' : 'bg-accent/30 text-foreground'}`}>
                    {m.role === 'assistant' ? <Bot className="h-4 w-4"/> : <User className="h-4 w-4"/>}
                  </div>
                  <div className={`${m.role === 'assistant' ? 'bg-muted/60 border border-border' : 'bg-accent/30 border border-accent/40'} rounded-lg p-3 whitespace-pre-wrap`}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3 space-y-3 bg-background/60 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Badge key={s.label} variant="secondary" className="cursor-pointer" onClick={() => handleSubmit(s.text)}>
                  {s.label}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your farm data..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => (e.key === 'Enter' ? handleSubmit() : undefined)}
                disabled={busy}
              />
              <Button onClick={() => handleSubmit()} disabled={busy || !input.trim()}>
                Send
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

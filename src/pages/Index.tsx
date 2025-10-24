import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Beef, Droplets, Sun, Store, Bot, Plug, ShieldCheck, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import farmHero from '@/assets/farm-hero.jpg';
import PluginCard from '@/components/PluginCard';
import SectionHeader from '@/components/SectionHeader';
import FeatureCard from '@/components/FeatureCard';
import { mockAssistant } from '@/lib/aiAssistant';
import { toast } from 'sonner';
import { builtInModules } from '@/lib/plugins';
import type { Metric } from '@/lib/types';
import { ChartContainer } from '@/components/ui/chart';
import * as Recharts from 'recharts';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="font-semibold">FarmHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#modules" className="hover:text-primary">Modules</a>
            <a href="#ai" className="hover:text-primary">AI Assistant</a>
            <a href="#marketplace" className="hover:text-primary">Marketplace</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
            <Button onClick={() => navigate('/login')} className="gap-2">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img src={farmHero} alt="Farm fields" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">Unified farm OS</Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              One dashboard to manage your entire farm—from soil to solar to sales.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              FarmHub is a modular platform that connects your devices, centralizes data, and uses AI to help you make better, faster decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/marketplace')}>
                Explore Marketplace
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> No credit card • Self-serve setup • Works with your tools
            </div>
          </div>
          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Sensors connected', value: '128' },
              { label: 'Water saved (ytd)', value: '12.4M L' },
              { label: 'Energy produced', value: '38.2 MWh' },
              { label: 'Tasks automated', value: '342' },
            ].map((s, i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="mt-1 text-2xl font-semibold">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Trusted by */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Trusted by</span>
            {['AgriCoop', 'GreenTech', 'SolarX', 'IrrigaPro'].map((n) => (
              <Badge key={n} variant="outline">{n}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <SectionHeader
          title="Why FarmHub"
          subtitle="Connect everything, see everything, act with confidence."
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Plug className="h-6 w-6 text-primary" />, title: 'Connect your systems', description: 'Bring IoT sensors, solar, pumps, and tools into one place.' },
            { icon: <Bot className="h-6 w-6 text-primary" />, title: 'AI that works for you', description: 'Get irrigation alerts, vaccination reminders, and yield tips.' },
            { icon: <Store className="h-6 w-6 text-primary" />, title: 'Built to grow with you', description: 'Pick the tools you need. Add more as you grow.' },
          ].map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <SectionHeader title="Modular by design" subtitle="Turn features on or off with a click.">
          <Button variant="outline" onClick={() => navigate('/my-plugins')}>Manage my tools</Button>
        </SectionHeader>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { Icon: Sprout, name: 'Crop Management', desc: 'Planting, growth, and harvest tracking.' },
            { Icon: Beef, name: 'Livestock', desc: 'Health, feed, and vaccination schedules.' },
            { Icon: Droplets, name: 'Smart Irrigation', desc: 'Automated schedules and sensor-driven control.' },
            { Icon: Sun, name: 'Solar Monitoring', desc: 'Production, performance, and alerts.' },
            { Icon: Store, name: 'Marketplace', desc: 'List and sell directly from your dashboard.' },
          ].map(({ Icon, name, desc }, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Freemium core</Badge>
          <Badge variant="outline">Premium add-ons</Badge>
          <Badge variant="outline">Third‑party tools</Badge>
        </div>
      </section>

      {/* Integrations */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Connect your hardware and data</h2>
            <p className="mt-2 text-muted-foreground">
              FarmHub aggregates data from sensors, pumps, weather, and energy so you can monitor everything from one place.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['LoRaWAN', 'Modbus', 'MQTT', 'HTTP', 'CSV Import'].map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Soil moisture', value: '28% • Section B' },
              { title: 'Flow rate', value: '120 L/min • Main line' },
              { title: 'Solar today', value: '127 kWh • +15%' },
              { title: 'Weather', value: 'Rain in 6 hours' },
            ].map((c, i) => (
              <Card key={i}><CardContent className="p-4"><div className="text-sm font-medium">{c.title}</div><div className="text-xs text-muted-foreground mt-1">{c.value}</div></CardContent></Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant */}
      <section id="ai" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Bot className="h-6 w-6 text-primary" /> AI Assistant</h2>
          <p className="mt-2 text-muted-foreground">Actionable insights based on your farm's real data.</p>
        </div>
        {/* Live demo mini-chart + tips */}
        <div className="mt-6 grid md:grid-cols-5 gap-6 items-stretch">
          <Card className="md:col-span-2">
            <CardContent className="p-5 h-full flex flex-col">
              <div className="text-sm font-medium">Soil moisture (last 7 days)</div>
              <div className="mt-2 grow">
                <ChartContainer
                  config={{ moisture: { label: 'Moisture', color: 'hsl(var(--primary))' } }}
                  className="h-40"
                >
                  <Recharts.LineChart data={[
                    { d: 'D-6', moisture: 31 },
                    { d: 'D-5', moisture: 29 },
                    { d: 'D-4', moisture: 28 },
                    { d: 'D-3', moisture: 34 },
                    { d: 'D-2', moisture: 30 },
                    { d: 'D-1', moisture: 27 },
                    { d: 'Today', moisture: 33 },
                  ]}>
                    <Recharts.CartesianGrid vertical={false} />
                    <Recharts.XAxis dataKey="d" tickLine={false} axisLine={false} />
                    <Recharts.YAxis hide domain={[20, 40]} />
                    <Recharts.Line type="monotone" dataKey="moisture" stroke="var(--color-moisture)" strokeWidth={2} dot={false} />
                    <Recharts.Tooltip cursor={false} />
                  </Recharts.LineChart>
                </ChartContainer>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Target: 30% – 35%</div>
            </CardContent>
          </Card>
          <div className="md:col-span-3">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                'Irrigation alert: Section B is below 30% moisture. Suggested: 40 min at 2:30 PM.',
                'Vaccination reminder: 3 calves due this week. Add to schedule?',
                'Feed optimization: Adjust ration for cows in heat to improve yield.',
              ].map((tip, i) => (
                <Card key={i} className="border-primary/20"><CardContent className="p-5 text-sm">{tip}</CardContent></Card>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={async () => {
              // Demo call to the mock assistant
              const sampleMetrics: Metric[] = [
                { deviceId: 'sensor-1', key: 'soil_moisture', value: 27, unit: '%', at: new Date().toISOString() },
              ];
              const recs = await mockAssistant.recommendModules(sampleMetrics, builtInModules.map(({ component, ...m }) => m));
              if (recs.length) {
                toast.success(`Suggested module: ${recs.map((r) => r.name).join(', ')}`);
              } else {
                toast.info('No module recommendations right now.');
              }
            }}
          >
            Try AI recommendations
          </Button>
        </div>
      </section>

      {/* Marketplace preview */}
      <section id="marketplace" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Tool Marketplace</h2>
            <p className="mt-2 text-muted-foreground">Extend FarmHub with tools from us and the community.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/marketplace')}>Browse all</Button>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Smart Irrigation', description: 'Auto scheduling by weather and moisture', category: 'Crops & Irrigation', price: 'Free', rating: 4.8, downloads: '1,200' },
            { name: 'Livestock Tracker', description: 'Health + vaccination tracking', category: 'Livestock & Health', price: 'Free', rating: 4.9, downloads: '2,500' },
            { name: 'Crop Disease Detector', description: 'AI diagnosis from photos', category: 'Smart AI Tools', price: '50 TND/month', rating: 4.7, downloads: '890' },
          ].map((p, i) => (
            <PluginCard key={i} {...p} />
          ))}
        </div>
      </section>

      {/* Pricing/Monetization */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold">Simple pricing that scales</h3>
              <ul className="mt-3 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Freemium core dashboard</li>
                <li>Premium modules available</li>
                <li>Marketplace commission for third‑party tools</li>
                <li>Optional subscriptions for large farms/co‑ops</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">Free</div>
              <p className="text-sm text-muted-foreground">Start with the core dashboard and add modules anytime.</p>
              <Button className="mt-4 w-full" onClick={() => navigate('/login')}>Create free account</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Vision */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="rounded-xl border border-border p-8 bg-card">
          <p className="text-center text-lg md:text-xl font-medium">
            “One dashboard to manage your entire farm from soil to solar to sales.”
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sprout className="h-5 w-5 text-primary" /> FarmHub
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
            <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
            <Link to="/login" className="hover:text-primary">Login</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} FarmHub</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import Layout from '@/components/Layout';
import PluginCard from '@/components/PluginCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Power, Trash2, Pin, PinOff, ExternalLink } from 'lucide-react';
import { builtInModules } from '@/lib/plugins';
import { usePluginStore } from '@/hooks/useStore';
import { Link } from 'react-router-dom';

const MyPlugins = () => {
  const { pinnedModules, togglePinned } = usePluginStore();

  const installedPlugins = builtInModules.map((m) => ({
    id: m.id,
    route: m.route,
    name: m.name,
    description: m.description,
    category: m.id === 'livestock' ? 'Livestock & Health' : m.id === 'smart-irrigation' ? 'Crops & Irrigation' : m.id === 'marketplace' ? 'Sales & Market' : 'General',
    price: 'Free',
    rating: 4.8,
    downloads: '1,000',
    installed: true,
    status: m.id === 'smart-irrigation' ? 'paused' : 'active',
  }));

  const suggestedPlugins = [
    {
      name: 'Market Connector',
      description: 'Connect with buyers and list your products online',
      category: 'Sales & Market',
      price: 'Free',
      rating: 4.6,
      downloads: '3,100',
    },
    {
      name: 'Crop Disease Detector',
      description: 'AI-powered disease detection from plant photos',
      category: 'Smart AI Tools',
      price: '50 TND/month',
      rating: 4.7,
      downloads: '890',
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Tools</h1>
          <p className="text-muted-foreground">Manage your installed farm tools</p>
        </div>

        {/* Pinned to Sidebar */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Pinned to Sidebar</h2>
          <p className="text-sm text-muted-foreground mb-4">Choose the tools you want quick access to in the sidebar.</p>
          <div className="flex flex-wrap gap-2">
            {installedPlugins.map((p) => (
              <Button key={`pin-${p.id}`} size="sm" variant={pinnedModules[p.id] ? 'default' : 'outline'} className="gap-2" onClick={() => togglePinned(p.id)}>
                {pinnedModules[p.id] ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Tools */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Tools</h2>
            <Button variant="outline" size="sm">Update All</Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {installedPlugins
              .filter(p => p.status === 'active')
              .map((plugin, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{plugin.category}</Badge>
                      <Badge className="bg-primary/10 text-primary">Active</Badge>
                    </div>
                    <CardTitle className="text-lg">{plugin.name}</CardTitle>
                    <CardDescription>{plugin.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2">
                      <Link to={plugin.route} className="w-full">
                        <Button variant="default" size="sm" className="w-full gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </Button>
                      </Link>
                      <Button variant={pinnedModules[plugin.id] ? 'secondary' : 'outline'} size="sm" className="gap-2" onClick={() => togglePinned(plugin.id)}>
                        {pinnedModules[plugin.id] ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                        {pinnedModules[plugin.id] ? 'Pinned' : 'Pin'}
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full gap-2">
                      <Power className="h-4 w-4" />
                      Pause
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Paused Tools */}
        {installedPlugins.some(p => p.status === 'paused') && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Paused Tools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {installedPlugins
                .filter(p => p.status === 'paused')
                .map((plugin, index) => (
                  <Card key={index} className="opacity-60">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{plugin.category}</Badge>
                        <Badge variant="outline">Paused</Badge>
                      </div>
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <CardDescription>{plugin.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex gap-2">
                        <Link to={plugin.route} className="w-full">
                          <Button variant="default" size="sm" className="w-full gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </Button>
                        </Link>
                        <Button variant={pinnedModules[plugin.id] ? 'secondary' : 'outline'} size="sm" className="gap-2" onClick={() => togglePinned(plugin.id)}>
                          {pinnedModules[plugin.id] ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                          {pinnedModules[plugin.id] ? 'Pinned' : 'Pin'}
                        </Button>
                      </div>
                      <Button variant="default" size="sm" className="w-full gap-2">
                        <Power className="h-4 w-4" />
                        Activate
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Suggested Tools */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Suggested for You</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your farm setup, these tools might help you
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedPlugins.map((plugin, index) => (
              <PluginCard key={index} {...plugin} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyPlugins;

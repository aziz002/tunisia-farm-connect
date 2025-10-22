import Layout from '@/components/Layout';
import PluginCard from '@/components/PluginCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Power, Trash2 } from 'lucide-react';

const MyPlugins = () => {
  const installedPlugins = [
    {
      name: 'Livestock Tracker',
      description: 'Track animal health, vaccinations, and feeding schedules',
      category: 'Livestock & Health',
      price: 'Free',
      rating: 4.9,
      downloads: '2,500',
      installed: true,
      status: 'active'
    },
    {
      name: 'Weather Forecaster',
      description: 'Get detailed weather forecasts tailored to your location',
      category: 'Crops & Irrigation',
      price: 'Free',
      rating: 4.8,
      downloads: '4,200',
      installed: true,
      status: 'active'
    },
    {
      name: 'Smart Irrigation',
      description: 'Automatically schedule watering based on weather and soil moisture',
      category: 'Crops & Irrigation',
      price: 'Free',
      rating: 4.8,
      downloads: '1,200',
      installed: true,
      status: 'paused'
    },
  ];

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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Plugins</h1>
          <p className="text-muted-foreground">Manage your installed farm tools</p>
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

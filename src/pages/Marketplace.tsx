import { useState } from 'react';
import Layout from '@/components/Layout';
import PluginCard from '@/components/PluginCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const plugins = [
    {
      name: 'Smart Irrigation',
      description: 'Automatically schedule watering based on weather and soil moisture',
      category: 'Crops & Irrigation',
      price: 'Free',
      rating: 4.8,
      downloads: '1,200',
    },
    {
      name: 'Livestock Tracker',
      description: 'Track animal health, vaccinations, and feeding schedules',
      category: 'Livestock & Health',
      price: 'Free',
      rating: 4.9,
      downloads: '2,500',
    },
    {
      name: 'Crop Disease Detector',
      description: 'AI-powered disease detection from plant photos',
      category: 'Smart AI Tools',
      price: '50 TND/month',
      rating: 4.7,
      downloads: '890',
    },
    {
      name: 'Market Connector',
      description: 'Connect with buyers and list your products online',
      category: 'Sales & Market',
      price: 'Free',
      rating: 4.6,
      downloads: '3,100',
    },
    {
      name: 'Solar Monitor',
      description: 'Track solar panel performance and energy production',
      category: 'Energy & Water',
      price: 'Free',
      rating: 4.5,
      downloads: '670',
    },
    {
      name: 'Weather Forecaster',
      description: 'Get detailed weather forecasts tailored to your location',
      category: 'Crops & Irrigation',
      price: 'Free',
      rating: 4.8,
      downloads: '4,200',
    },
  ];

  const categories = [
    'All Tools',
    'Crops & Irrigation',
    'Livestock & Health',
    'Energy & Water',
    'Sales & Market',
    'Smart AI Tools',
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Plugin Marketplace</h1>
          <p className="text-muted-foreground">Discover and add new tools to enhance your farm</p>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for farm tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>Search</Button>
        </div>

        {/* Categories Tabs */}
        <Tabs defaultValue="All Tools" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="All Tools" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugins.map((plugin, index) => (
                <PluginCard key={index} {...plugin} />
              ))}
            </div>
          </TabsContent>

          {categories.slice(1).map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plugins
                  .filter((p) => p.category === category)
                  .map((plugin, index) => (
                    <PluginCard key={index} {...plugin} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Marketplace;

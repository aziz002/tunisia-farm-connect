import Layout from '@/components/Layout';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, Beef, Sun, ShoppingBag, Plus, Bell, Calendar, Droplets, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const reminders = [
    { id: 1, text: 'Vaccinate 3 calves this week', urgent: true, icon: Beef },
    { id: 2, text: 'Tomatoes need watering tomorrow', urgent: false, icon: Sprout },
    { id: 3, text: 'Next market day: Sunday in Sousse', urgent: false, icon: Calendar },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Ahmed</h1>
            <p className="text-muted-foreground">Here's what's happening with your farm today</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Quick Add
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Crops"
            icon={Sprout}
            value="12"
            subtitle="5 ready to harvest"
            trend="↑ 2 this week"
            iconColor="text-primary"
          />
          <DashboardCard
            title="Livestock"
            icon={Beef}
            value="45"
            subtitle="3 vaccinations due"
            trend="All healthy"
            iconColor="text-accent"
          />
          <DashboardCard
            title="Solar Energy"
            icon={Sun}
            value="127 kWh"
            subtitle="Today's production"
            trend="↑ 15% vs yesterday"
            iconColor="text-secondary"
          />
          <DashboardCard
            title="Market Sales"
            icon={ShoppingBag}
            value="2,450 TND"
            subtitle="This month"
            trend="↑ 8% vs last month"
            iconColor="text-primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reminders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Reminders & Tasks
                </CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminders.map((reminder) => {
                  const Icon = reminder.icon;
                  return (
                    <div 
                      key={reminder.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 text-sm">{reminder.text}</span>
                      {reminder.urgent && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add New Task
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => navigate('/smart-irrigation')}
              >
                <Droplets className="h-4 w-4" />
                Smart Irrigation
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => navigate('/marketplace-seller')}
              >
                <Store className="h-4 w-4" />
                Seller Console
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Sprout className="h-4 w-4" />
                Add Crop
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Beef className="h-4 w-4" />
                Add Animal
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <ShoppingBag className="h-4 w-4" />
                List Product
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Task
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

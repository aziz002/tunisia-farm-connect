import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Plus, Edit, Trash2, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Sensor {
  id: number;
  name: string;
  type: string;
  status: 'active' | 'warning' | 'offline';
  value: string;
  location: string;
}

interface FieldSection {
  id: number;
  name: string;
  cropType: string;
  waterAmount: string;
  status: 'watered' | 'needs-water' | 'scheduled';
}

const SmartIrrigation = () => {
  const [sensors, setSensors] = useState<Sensor[]>([
    { id: 1, name: 'Soil Moisture A1', type: 'Moisture', status: 'active', value: '45%', location: 'Section A' },
    { id: 2, name: 'Soil Moisture B2', type: 'Moisture', status: 'warning', value: '28%', location: 'Section B' },
    { id: 3, name: 'Water Flow Main', type: 'Flow', status: 'active', value: '120 L/min', location: 'Main Line' },
    { id: 4, name: 'Pressure Monitor', type: 'Pressure', status: 'active', value: '2.5 Bar', location: 'Pump' },
  ]);

  const [fieldSections, setFieldSections] = useState<FieldSection[]>([
    { id: 1, name: 'Section A', cropType: 'Tomatoes', waterAmount: '25 L/day', status: 'watered' },
    { id: 2, name: 'Section B', cropType: 'Peppers', waterAmount: '20 L/day', status: 'needs-water' },
    { id: 3, name: 'Section C', cropType: 'Olives', waterAmount: '15 L/day', status: 'watered' },
    { id: 4, name: 'Section D', cropType: 'Wheat', waterAmount: '10 L/day', status: 'scheduled' },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'watered':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'warning':
      case 'needs-water':
        return <AlertTriangle className="h-4 w-4 text-secondary" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'watered':
        return <Badge variant="default" className="bg-primary">Active</Badge>;
      case 'warning':
      case 'needs-water':
        return <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Needs Attention</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Smart Irrigation</h1>
            </div>
            <p className="text-muted-foreground">Monitor and control your farm's water system</p>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Water Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1,250 L</div>
              <p className="text-xs text-muted-foreground mt-1">↓ 15% vs yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sensors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">4/4</div>
              <p className="text-xs text-primary mt-1">All operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sections Watered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2/4</div>
              <p className="text-xs text-secondary mt-1">2 pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2:30 PM</div>
              <p className="text-xs text-muted-foreground mt-1">Section B & D</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sensors List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Sensors
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Sensor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Sensor</DialogTitle>
                      <DialogDescription>Add a new sensor to monitor your irrigation system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Sensor Name</Label>
                        <Input placeholder="e.g., Soil Moisture A1" />
                      </div>
                      <div>
                        <Label>Sensor Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="moisture">Soil Moisture</SelectItem>
                            <SelectItem value="flow">Water Flow</SelectItem>
                            <SelectItem value="pressure">Pressure</SelectItem>
                            <SelectItem value="temperature">Temperature</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input placeholder="e.g., Section A" />
                      </div>
                      <Button className="w-full">Add Sensor</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sensors.map((sensor) => (
                  <div 
                    key={sensor.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    {getStatusIcon(sensor.status)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{sensor.name}</div>
                      <div className="text-xs text-muted-foreground">{sensor.location} • {sensor.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{sensor.value}</div>
                      {getStatusBadge(sensor.status)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Field Blueprint */}
          <Card>
            <CardHeader>
              <CardTitle>Field Blueprint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {fieldSections.map((section) => (
                  <div
                    key={section.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      section.status === 'watered' 
                        ? 'border-primary bg-primary/5' 
                        : section.status === 'needs-water'
                        ? 'border-secondary bg-secondary/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">{section.name}</div>
                      {getStatusIcon(section.status)}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{section.cropType}</div>
                    <div className="text-xs font-medium text-foreground">{section.waterAmount}</div>
                    <div className="mt-2">{getStatusBadge(section.status)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Irrigation Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today's Irrigation Schedule</CardTitle>
              <Button variant="outline" size="sm">Edit Schedule</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <div className="w-20 text-center">
                  <div className="text-sm font-medium">6:00 AM</div>
                  <Badge variant="default" className="mt-1 bg-primary">Complete</Badge>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Section A - Tomatoes</div>
                  <div className="text-xs text-muted-foreground">Duration: 45 min • Amount: 25 L</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <div className="w-20 text-center">
                  <div className="text-sm font-medium">2:30 PM</div>
                  <Badge variant="outline" className="mt-1">Scheduled</Badge>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Section B - Peppers</div>
                  <div className="text-xs text-muted-foreground">Duration: 40 min • Amount: 20 L</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <div className="w-20 text-center">
                  <div className="text-sm font-medium">5:00 PM</div>
                  <Badge variant="outline" className="mt-1">Scheduled</Badge>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Section D - Wheat</div>
                  <div className="text-xs text-muted-foreground">Duration: 30 min • Amount: 10 L</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SmartIrrigation;
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, AlertCircle, Calendar, Download } from 'lucide-react';

const Livestock = () => {
  const animals = [
    { id: 1, type: 'Cow', name: 'Bella', age: '3 years', status: 'healthy', nextVaccination: '2025-11-01' },
    { id: 2, type: 'Cow', name: 'Luna', age: '2 years', status: 'healthy', nextVaccination: '2025-10-28' },
    { id: 3, type: 'Cow', name: 'Daisy', age: '4 years', status: 'needs-vaccine', nextVaccination: '2025-10-25' },
    { id: 4, type: 'Sheep', name: 'Fluffy', age: '1 year', status: 'healthy', nextVaccination: '2025-11-05' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-primary/10 text-primary">Healthy</Badge>;
      case 'needs-vaccine':
        return <Badge variant="destructive">Vaccine Due</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = [
    { label: 'Total Animals', value: '45', color: 'text-primary' },
    { label: 'Cows', value: '15', color: 'text-foreground' },
    { label: 'Sheep', value: '30', color: 'text-foreground' },
    { label: 'Vaccinations Due', value: '3', color: 'text-accent' },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Livestock Manager</h1>
            <p className="text-muted-foreground">Track and manage your animals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Export Report
            </Button>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add Animal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert Card */}
        <Card className="mb-8 border-accent">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-accent" />
            <p className="text-sm">
              <strong>3 animals</strong> need vaccination this week. Tap to see details and schedule.
            </p>
            <Button size="sm" variant="outline" className="ml-auto">
              View Details
            </Button>
          </CardContent>
        </Card>

        {/* Animals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Animals</CardTitle>
            <CardDescription>Manage health records and track vaccinations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Vaccination</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">{animal.name}</TableCell>
                    <TableCell>{animal.type}</TableCell>
                    <TableCell>{animal.age}</TableCell>
                    <TableCell>{getStatusBadge(animal.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {animal.nextVaccination}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Livestock;

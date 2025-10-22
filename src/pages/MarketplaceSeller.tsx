import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, TrendingUp, Package, Eye } from 'lucide-react';

const MarketplaceSeller = () => {
  const listings = [
    { id: 1, product: 'Fresh Tomatoes', quantity: '50 kg', price: '3.5 TND/kg', status: 'active', views: 127, inquiries: 8 },
    { id: 2, product: 'Olive Oil', quantity: '20 L', price: '45 TND/L', status: 'active', views: 203, inquiries: 15 },
    { id: 3, product: 'Wheat', quantity: '200 kg', price: '1.2 TND/kg', status: 'sold', views: 89, inquiries: 3 },
    { id: 4, product: 'Dairy Milk', quantity: '100 L', price: '2 TND/L', status: 'active', views: 156, inquiries: 12 },
  ];

  const stats = [
    { label: 'Active Listings', value: '3', icon: Package, color: 'text-primary' },
    { label: 'Total Views', value: '575', icon: Eye, color: 'text-secondary' },
    { label: 'This Month Earnings', value: '2,450 TND', icon: TrendingUp, color: 'text-accent' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary/10 text-primary">Active</Badge>;
      case 'sold':
        return <Badge variant="secondary">Sold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Marketplace Seller</h1>
            <p className="text-muted-foreground">List and sell your farm products</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add New Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tips Card */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-foreground">
              💡 <strong>Pro Tip:</strong> Products with photos get 3x more inquiries. Add clear photos to boost your sales!
            </p>
          </CardContent>
        </Card>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>Manage your products and track performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Views</TableHead>
                  <TableHead className="text-center">Inquiries</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.product}</TableCell>
                    <TableCell>{listing.quantity}</TableCell>
                    <TableCell>{listing.price}</TableCell>
                    <TableCell>{getStatusBadge(listing.status)}</TableCell>
                    <TableCell className="text-center">{listing.views}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{listing.inquiries}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Buyer Contacts Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Buyer Inquiries</CardTitle>
            <CardDescription>Connect with interested buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { buyer: 'Mohamed K.', product: 'Olive Oil', region: 'Sousse', message: 'Interested in bulk order' },
                { buyer: 'Fatima B.', product: 'Dairy Milk', region: 'Nabeul', message: 'Weekly delivery possible?' },
                { buyer: 'Ali T.', product: 'Fresh Tomatoes', region: 'Tunis', message: 'Can you deliver to Tunis?' },
              ].map((inquiry, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{inquiry.buyer}</span>
                      <Badge variant="outline" className="text-xs">{inquiry.region}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{inquiry.product}</p>
                    <p className="text-sm italic mt-1">"{inquiry.message}"</p>
                  </div>
                  <Button size="sm">Contact</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MarketplaceSeller;

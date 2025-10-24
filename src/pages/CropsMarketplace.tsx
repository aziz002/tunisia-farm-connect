import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Phone, Mail, MapPin, ShoppingBag, Filter, Search, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';

type Listing = {
  id: number;
  product: string;
  category: 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains' | 'Oil';
  quantity: string;
  unitPrice: string; // display price like '3.5 TND/kg'
  city: string;
  market: string;
  days: string; // e.g., 'Fri • Sun'
  seller: string;
  phone: string;
  email?: string;
  source?: string;
  sourceUrl?: string;
};

const seedListings: Listing[] = [
  { id: 1, product: 'Fresh Tomatoes', category: 'Vegetables', quantity: '50 kg', unitPrice: '3.5 TND/kg', city: 'Sousse', market: 'Souk El Jumaa', days: 'Fri • Sun', seller: 'Ahmed B.', phone: '+216 22 111 222', email: 'ahmed@example.com', source: 'Facebook Group • Tunisia Agri', sourceUrl: 'https://facebook.com/groups/tunisia-agri' },
  { id: 2, product: 'Olive Oil (extra virgin)', category: 'Oil', quantity: '20 L', unitPrice: '45 TND/L', city: 'Tunis', market: 'Marché Central', days: 'Sat', seller: 'Sami O.', phone: '+216 23 333 444', email: 'sami.o@example.com', source: 'SoukTN Marketplace', sourceUrl: 'https://souk.tn' },
  { id: 3, product: 'Dairy Milk (fresh)', category: 'Dairy', quantity: '80 L', unitPrice: '2 TND/L', city: 'Nabeul', market: 'Souk Nabeul', days: 'Daily', seller: 'Fatima L.', phone: '+216 55 555 555', email: 'fatima@example.com', source: 'WhatsApp • Local Buyer Circle' },
  { id: 4, product: 'Durum Wheat', category: 'Grains', quantity: '200 kg', unitPrice: '1.2 TND/kg', city: 'Kairouan', market: 'Souk Kairouan', days: 'Thu', seller: 'Youssef M.', phone: '+216 29 777 999' },
  { id: 5, product: 'Oranges (Maltaise)', category: 'Fruits', quantity: '120 kg', unitPrice: '2.8 TND/kg', city: 'Nabeul', market: 'Souk Nabeul', days: 'Wed • Sat', seller: 'Rim T.', phone: '+216 98 101 202' },
];

export default function CropsMarketplace() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [tab, setTab] = useState<'cards' | 'table'>('cards');

  const cities = useMemo(() => ['all', ...Array.from(new Set(seedListings.map((l) => l.city)))], []);
  const categories = ['all', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Oil'] as const;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return seedListings.filter((l) => {
      const mQ = !q || [l.product, l.market, l.seller].some((s) => s.toLowerCase().includes(q));
      const mC = city === 'all' || l.city === city;
      const mCat = category === 'all' || l.category === (category as Listing['category']);
      return mQ && mC && mCat;
    });
  }, [query, city, category]);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Crops Marketplace</h1>
              <p className="text-sm text-muted-foreground">Browse farm products by market, contact sellers, and buy directly</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search product, market, or seller" className="pl-8 w-64" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (<SelectItem key={c} value={c}>{c === 'all' ? 'All cities' : c}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (<SelectItem key={c} value={c}>{c === 'all' ? 'All categories' : c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <TabsContent value="cards" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((l) => (
                <Card key={l.id} className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{l.product}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{l.category}</Badge>
                      <span className="text-xs text-muted-foreground">{l.quantity}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    <div className="text-sm font-semibold text-primary">{l.unitPrice}</div>
                    <div className="text-sm flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4"/> {l.market}, {l.city} • {l.days}</div>
                    <div className="text-sm">Seller: <span className="font-medium">{l.seller}</span></div>
                    {l.source && (
                      <div className="text-xs">
                        <a href={l.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:underline">
                          <ExternalLink className="h-3 w-3"/> Source: {l.source}
                        </a>
                      </div>
                    )}
                    <div className="pt-2 flex gap-2">
                      <a href={`tel:${l.phone.replace(/\s/g,'')}`} className="w-1/2"><Button className="w-full" variant="default"><Phone className="h-4 w-4 mr-1"/> Call</Button></a>
                      {l.email && <a href={`mailto:${l.email}`} className="w-1/2"><Button className="w-full" variant="outline"><Mail className="h-4 w-4 mr-1"/> Email</Button></a>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="table" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Market</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead className="text-right">Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((l) => (
                      <TableRow key={`row-${l.id}`}>
                        <TableCell className="font-medium">{l.product}</TableCell>
                        <TableCell>{l.category}</TableCell>
                        <TableCell>{l.quantity}</TableCell>
                        <TableCell>{l.unitPrice}</TableCell>
                        <TableCell>{l.market} • {l.days}</TableCell>
                        <TableCell>{l.city}</TableCell>
                        <TableCell>{l.seller}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <a href={`tel:${l.phone.replace(/\s/g,'')}`}><Button size="sm"><Phone className="h-4 w-4 mr-1"/> Call</Button></a>
                            {l.email && <a href={`mailto:${l.email}`}><Button size="sm" variant="outline"><Mail className="h-4 w-4 mr-1"/> Email</Button></a>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

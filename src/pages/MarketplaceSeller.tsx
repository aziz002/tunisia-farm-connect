import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, Package, Eye, Phone, Mail, ExternalLink, Save, X, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSalesStore, type Listing, type Offer, type BuyerLead, type Channel, type Posting } from '@/hooks/useSalesStore';
import { Switch } from '@/components/ui/switch';

function priceUnitLabel(u: string) {
  switch (u) {
    case 'per_kg':
      return '/kg';
    case 'per_ton':
      return '/ton';
    case 'per_liter':
      return '/L';
    case 'total':
    default:
      return ' total';
  }
}

function qtyUnitLabel(u: string) {
  switch (u) {
    case 'kg':
      return 'kg';
    case 'ton':
      return 'ton';
    case 'L':
      return 'L';
    case 'head':
      return 'head';
    default:
      return 'unit';
  }
}

export default function SalesDashboard() {
  const { listings, leads, offers, channels, postings, addListing, removeListing, seedDemoData, toggleChannel, broadcastListing, autoPostEnabled, setAutoPostEnabled } = useSalesStore();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'listings' | 'markets' | 'buyers' | 'distribution'>('listings');
  const [selectedListingId, setSelectedListingId] = useState<number | undefined>(undefined);
  const location = useLocation();

  // Seed demo data if empty
  useEffect(() => {
    if (listings.length === 0 && leads.length === 0 && offers.length === 0) {
      seedDemoData();
    }
  }, [listings.length, leads.length, offers.length, seedDemoData]);

  // Set initial tab based on hash (e.g., #distribution)
  useEffect(() => {
    const h = (location.hash || '').replace('#','');
    if (h === 'buyers' || h === 'markets' || h === 'distribution' || h === 'listings') {
      setTab(h as typeof tab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCount = listings.length;
  const offersCount = offers.length;
  const buyersCount = leads.length;

  const marketsAgg = useMemo(() => {
    const map = new Map<string, { city: string; offers: Offer[] }>();
    for (const o of offers) {
      const key = `${o.market}-${o.city}`;
      if (!map.has(key)) map.set(key, { city: o.city, offers: [] });
      map.get(key)!.offers.push(o);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ market: k.split('-')[0], city: v.city, offers: v.offers }));
  }, [offers]);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Sales Dashboard</h1>
            <p className="text-muted-foreground">Auto-post your listings to markets and groups; we brief you when buyers engage</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2"><Plus className="h-5 w-5"/> Add Listing</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add a new listing</DialogTitle>
              </DialogHeader>
              <AddListingForm onCancel={() => setOpen(false)} onSave={(data) => { addListing(data); setOpen(false); }} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Auto-post global toggle */}
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">Auto-post new listings</div>
              <div className="text-sm text-muted-foreground">When on, we publish to all enabled channels automatically</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{autoPostEnabled ? 'On' : 'Off'}</span>
              <Switch checked={autoPostEnabled} onCheckedChange={setAutoPostEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[{ label: 'Active Listings', value: activeCount, icon: Package, color: 'text-primary' }, { label: 'Open Offers', value: offersCount, icon: Eye, color: 'text-secondary' }, { label: 'Potential Buyers', value: buyersCount, icon: TrendingUp, color: 'text-accent' }].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription>{s.label}</CardDescription>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="markets">Markets & Offers</TabsTrigger>
            <TabsTrigger value="buyers">Potential Buyers</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          {/* Listings */}
          <TabsContent value="listings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>My Listings</CardTitle>
                <CardDescription>Products you are currently selling</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead>Market</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Targets</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.product}</TableCell>
                        <TableCell>{l.type}</TableCell>
                        <TableCell>{l.quantity} {qtyUnitLabel(l.qtyUnit)}</TableCell>
                        <TableCell>{l.priceMin} - {l.priceMax} TND{priceUnitLabel(l.priceUnit)}</TableCell>
                        <TableCell>{l.market}</TableCell>
                        <TableCell>{l.city}</TableCell>
                        <TableCell>{l.days}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(l.targets || []).map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                            ))}
                            {(!l.targets || l.targets.length === 0) && (
                              <span className="text-xs text-muted-foreground">All buyers</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => removeListing(l.id)}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {listings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">No listings yet. Click "Add Listing" to publish your first product.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Markets & Offers */}
          <TabsContent value="markets" className="mt-4 space-y-4">
            {marketsAgg.length === 0 && (
              <Card><CardContent className="p-6 text-center text-muted-foreground">No offers yet. When buyers propose a price, they will appear here grouped by market.</CardContent></Card>
            )}
            {marketsAgg.map((mkt, idx) => (
              <Card key={`mkt-${idx}`}>
                <CardHeader>
                  <CardTitle>{mkt.market} • {mkt.city}</CardTitle>
                  <CardDescription>Offers received in this market</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Offer</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Contact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mkt.offers.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell>{o.product}</TableCell>
                          <TableCell>{o.price} TND{priceUnitLabel(o.priceUnit)}</TableCell>
                          <TableCell>{o.buyer}</TableCell>
                          <TableCell><Badge variant={o.status === 'new' ? 'secondary' : o.status === 'accepted' ? 'default' : 'outline'}>{o.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {o.phone && <a href={`tel:${o.phone.replace(/\s/g,'')}`}><Button size="sm"><Phone className="h-4 w-4 mr-1"/>Call</Button></a>}
                              {o.email && <a href={`mailto:${o.email}`}><Button size="sm" variant="outline"><Mail className="h-4 w-4 mr-1"/>Email</Button></a>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Buyers */}
          <TabsContent value="buyers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Potential Buyers & Sources</CardTitle>
                <CardDescription>Connect with interested buyers and see where they found you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leads.map((b) => (
                    <div key={`buyer-${b.id}`} className="p-4 rounded-lg border border-border">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{b.name}</span>
                          <Badge variant="outline" className="text-xs">{b.region}</Badge>
                          <Badge variant="secondary" className="text-xs">{b.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${b.phone.replace(/\s/g,'')}`} className="inline-flex items-center gap-1 text-sm hover:underline"><Phone className="h-4 w-4"/> {b.phone}</a>
                          {b.email && (<><Separator orientation="vertical" className="h-4"/><a href={`mailto:${b.email}`} className="inline-flex items-center gap-1 text-sm hover:underline"><Mail className="h-4 w-4"/> Email</a></>)}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{b.product}</div>
                      {b.message && <div className="mt-1 text-sm italic">"{b.message}"</div>}
                      {b.source && (
                        <div className="mt-2 text-xs">
                          <a href={b.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:underline">
                            <ExternalLink className="h-3 w-3"/> Source: {b.source}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground">No buyers yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution */}
          <TabsContent value="distribution" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Channels</CardTitle>
                <CardDescription>Where your listings are posted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {channels.map((c) => (
                    <div key={`ch-${c.id}`} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex flex-col">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.type}{c.url ? ` • ${c.url}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Enabled</span>
                        <Switch checked={c.enabled} onCheckedChange={(v) => toggleChannel(c.id, v)} />
                      </div>
                    </div>
                  ))}
                  {channels.length === 0 && (
                    <div className="text-sm text-muted-foreground">No channels yet. We seed a few demos on first load.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Broadcast a listing</CardTitle>
                <CardDescription>Select a listing and post it to all enabled channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  <div className="flex-1 w-full">
                    <Select value={selectedListingId?.toString()} onValueChange={(v) => setSelectedListingId(Number(v))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Choose a listing"/></SelectTrigger>
                      <SelectContent>
                        {listings.map((l) => (
                          <SelectItem value={l.id.toString()} key={`ls-${l.id}`}>{l.product} • {l.city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button disabled={!selectedListingId || channels.filter((c) => c.enabled).length === 0} onClick={() => selectedListingId && broadcastListing(selectedListingId)} className="gap-2">
                    <Send className="h-4 w-4"/> Post to enabled channels
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent postings</CardTitle>
                <CardDescription>Last broadcasts across your channels</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postings.slice(0, 10).map((p) => {
                      const l = listings.find((x) => x.id === p.listingId);
                      const c = channels.find((x) => x.id === p.channelId);
                      return (
                        <TableRow key={`p-${p.id}`}>
                          <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                          <TableCell>{l ? l.product : `#${p.listingId}`}</TableCell>
                          <TableCell>{c ? c.name : `#${p.channelId}`}</TableCell>
                          <TableCell><Badge variant={p.status === 'posted' ? 'secondary' : p.status === 'scheduled' ? 'outline' : 'destructive'}>{p.status}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                    {postings.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No postings yet.</TableCell></TableRow>
                    )}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function AddListingForm({ onSave, onCancel }: { onSave: (l: Omit<Listing, 'id' | 'createdAt'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<Listing, 'id' | 'createdAt'>>({
    type: 'Crop',
    product: '',
    quantity: 0,
    qtyUnit: 'kg',
    priceMin: 0,
    priceMax: 0,
    priceUnit: 'per_kg',
    city: '',
    market: '',
    days: 'Fri • Sun',
    notes: '',
    targets: [],
  });
  const SEGMENTS = ['Hotels', 'Restaurants', 'Wholesalers', 'Retailers', 'Exporters', 'Resellers'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Type">
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Listing['type'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Crop">Crop</SelectItem>
              <SelectItem value="Animal">Animal</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Product">
          <Input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Fresh Tomatoes" />
        </Field>
        <Field label="Quantity">
          <div className="flex gap-2">
            <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <Select value={form.qtyUnit} onValueChange={(v) => setForm({ ...form, qtyUnit: v as Listing['qtyUnit'] })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="ton">ton</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="head">head</SelectItem>
                <SelectItem value="unit">unit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Price Range (TND)">
          <div className="flex gap-2">
            <Input type="number" value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: Number(e.target.value) })} placeholder="Min" />
            <Input type="number" value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: Number(e.target.value) })} placeholder="Max" />
          </div>
        </Field>
        <Field label="Price Unit">
          <Select value={form.priceUnit} onValueChange={(v) => setForm({ ...form, priceUnit: v as Listing['priceUnit'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="per_kg">per kg</SelectItem>
              <SelectItem value="per_ton">per ton</SelectItem>
              <SelectItem value="per_liter">per liter</SelectItem>
              <SelectItem value="total">total</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Days available">
          <Input value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} placeholder="Fri • Sun" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="City">
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Sousse" />
        </Field>
        <Field label="Market">
          <Input value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })} placeholder="Souk El Jumaa" />
        </Field>
        <Field label="Notes (optional)">
          <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Pick-up 7-11 AM" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Field label="Target buyers (optional)">
          <div className="flex flex-wrap gap-2">
            {SEGMENTS.map((seg) => {
              const active = (form.targets || []).includes(seg);
              return (
                <button
                  type="button"
                  key={seg}
                  onClick={() => {
                    const cur = new Set(form.targets || []);
                    if (cur.has(seg)) cur.delete(seg); else cur.add(seg);
                    setForm({ ...form, targets: Array.from(cur) });
                  }}
                  className={`text-xs px-2 py-1 rounded border transition ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent/50'}`}
                >
                  {seg}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="gap-2"><X className="h-4 w-4"/> Cancel</Button>
        <Button onClick={() => onSave(form)} className="gap-2"><Save className="h-4 w-4"/> Save</Button>
      </div>
    </div>
  );
}

import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Phone, Mail, ExternalLink, Save, X, Send, Eye, Share2 } from 'lucide-react';
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
  const { listings, leads, offers, channels, postings, addListing, removeListing, seedDemoData, seedChannels, toggleChannel, broadcastListing, autoPostEnabled, setAutoPostEnabled } = useSalesStore();
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | undefined>(undefined);
  const location = useLocation();
  // Filters
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Crop' | 'Animal' | 'Other'>('all');
  const [cityFilter, setCityFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'posted' | 'not_posted'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | number>('all');
  const [targetFilter, setTargetFilter] = useState<string[]>([]);

  // Seed demo data if empty
  useEffect(() => {
    if (listings.length === 0 && leads.length === 0 && offers.length === 0) {
      seedDemoData();
    }
  }, [listings.length, leads.length, offers.length, seedDemoData]);

  // Ensure channels are seeded even if other data exists
  useEffect(() => {
    if (channels.length === 0) {
      seedChannels();
    }
  }, [channels.length, seedChannels]);

  // No tabs now; keep hash for potential anchors later
  useEffect(() => {
    void location; // placeholder to avoid unused var lint in some setups
  }, [location]);

  const activeCount = listings.length;
  const offersCount = offers.length;
  const buyersCount = leads.length;

  // Derived: cities and targets for filters
  const uniqueCities = useMemo(() => Array.from(new Set(listings.map(l => l.city))).sort(), [listings]);
  const uniqueTargets = useMemo(() => Array.from(new Set(listings.flatMap(l => l.targets || []))).sort(), [listings]);
  const filteredListings = useMemo(() => {
    const text = q.trim().toLowerCase();
    const byIdPosted = new Set(postings.map(p => p.listingId));
    return listings.filter(l => {
      if (text && !(l.product.toLowerCase().includes(text) || l.city.toLowerCase().includes(text))) return false;
      if (typeFilter !== 'all' && l.type !== typeFilter) return false;
      if (cityFilter !== 'all' && l.city !== cityFilter) return false;
      if (statusFilter === 'posted' && !byIdPosted.has(l.id)) return false;
      if (statusFilter === 'not_posted' && byIdPosted.has(l.id)) return false;
      if (targetFilter.length > 0) {
        const hasAny = (l.targets || []).some(t => targetFilter.includes(t));
        if (!hasAny) return false;
      }
      if (channelFilter !== 'all') {
        const postedToChannel = postings.some(p => p.listingId === l.id && p.channelId === channelFilter);
        const leadsFromChannel = leads.some(b => b.product === l.product && b.channelId === channelFilter);
        if (!postedToChannel && !leadsFromChannel) return false;
      }
      return true;
    });
  }, [q, typeFilter, cityFilter, statusFilter, channelFilter, targetFilter, listings, postings, leads]);

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
          {[{ label: 'Active Listings', value: activeCount }, { label: 'Open Offers', value: offersCount }, { label: 'Potential Buyers', value: buyersCount }].map((s, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><CardDescription>{s.label}</CardDescription></CardHeader>
              <CardContent><div className="text-3xl font-bold">{s.value}</div></CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products or city..." />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger><SelectValue placeholder="Type"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Crop">Crop</SelectItem>
                <SelectItem value="Animal">Animal</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={(v) => setCityFilter(v as typeof cityFilter)}>
              <SelectTrigger><SelectValue placeholder="City"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {uniqueCities.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="not_posted">Not posted</SelectItem>
              </SelectContent>
            </Select>
            <div className="md:col-span-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Targets:</span>
                {uniqueTargets.length === 0 && <span className="text-xs text-muted-foreground">No targets yet</span>}
                {uniqueTargets.map(seg => {
                  const active = targetFilter.includes(seg);
                  return (
                    <button key={seg} type="button" onClick={() => {
                      const cur = new Set(targetFilter);
                      if (cur.has(seg)) cur.delete(seg); else cur.add(seg);
                      setTargetFilter(Array.from(cur));
                    }} className={`text-xs px-2 py-1 rounded border transition ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent/50'}`}>
                      {seg}
                    </button>
                  );
                })}
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Channel:</span>
                  <Select value={String(channelFilter)} onValueChange={(v) => setChannelFilter(v === 'all' ? 'all' : Number(v))}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Channel"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All channels</SelectItem>
                      {channels.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" onClick={() => { setQ(''); setTypeFilter('all'); setCityFilter('all'); setStatusFilter('all'); setTargetFilter([]); setChannelFilter('all'); }}>Clear</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Listings as cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((l) => {
            const lPostings = postings.filter((p) => p.listingId === l.id);
            const lOffers = offers.filter((o) => o.product === l.product);
            const lLeads = leads.filter((b) => b.product === l.product);
            return (
              <Card key={l.id} className="hover:shadow-sm transition">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{l.product}</CardTitle>
                      <CardDescription>{l.type} • {l.quantity} {qtyUnitLabel(l.qtyUnit)} • {l.city}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setSelectedListingId(l.id); setDetailsOpen(true); }} aria-label="Open details"><Eye className="h-4 w-4"/></Button>
                      <Button size="icon" variant="ghost" disabled={channels.filter((c) => c.enabled).length === 0} onClick={() => broadcastListing(l.id)} aria-label="Broadcast"><Send className="h-4 w-4"/></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">{l.priceMin}–{l.priceMax} TND{priceUnitLabel(l.priceUnit)}</div>
                  {(l.targets && l.targets.length > 0) && (
                    <div className="flex flex-wrap gap-1">
                      {l.targets.map((t) => (<Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>))}
                    </div>
                  )}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{lPostings.length} posts</span>
                    <span>{lLeads.length} buyers</span>
                    <span>{lOffers.length} offers</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {listings.length === 0 && (
            <Card className="col-span-full"><CardContent className="p-6 text-center text-muted-foreground">No listings yet. Click "Add Listing" to publish your first product.</CardContent></Card>
          )}
        </div>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl">
            {selectedListingId && (() => {
              const l = listings.find(x => x.id === selectedListingId)!;
              const lPostings = postings.filter(p => p.listingId === l.id);
              const lOffers = offers.filter(o => o.product === l.product);
              const lLeads = leads.filter(b => b.product === l.product);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between gap-2">
                      <span>{l.product}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={channels.filter((c) => c.enabled).length === 0} onClick={() => broadcastListing(l.id)} className="gap-1"><Share2 className="h-4 w-4"/> Broadcast</Button>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base">Overview</CardTitle><CardDescription>Quick facts</CardDescription></CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <div><span className="text-muted-foreground">Type:</span> {l.type}</div>
                        <div><span className="text-muted-foreground">Quantity:</span> {l.quantity} {qtyUnitLabel(l.qtyUnit)}</div>
                        <div><span className="text-muted-foreground">Price:</span> {l.priceMin}–{l.priceMax} TND{priceUnitLabel(l.priceUnit)}</div>
                        <div><span className="text-muted-foreground">Location:</span> {l.market} • {l.city}</div>
                        <div><span className="text-muted-foreground">Days:</span> {l.days}</div>
                        {l.notes && <div><span className="text-muted-foreground">Notes:</span> {l.notes}</div>}
                        {l.targets && l.targets.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">{l.targets.map(t => (<Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>))}</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base">Posted To</CardTitle><CardDescription>Networks and channels</CardDescription></CardHeader>
                      <CardContent>
                        {lPostings.length === 0 && <div className="text-sm text-muted-foreground">Not posted yet.</div>}
                        <div className="space-y-3">
                          {lPostings.map((p) => {
                            const c = channels.find(x => x.id === p.channelId);
                            const channelLeads = lLeads.filter(b => b.channelId === (c?.id || -1));
                            return (
                              <div key={p.id} className="p-2 rounded border">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{c ? c.name : `Channel #${p.channelId}`}</div>
                                    <div className="text-xs text-muted-foreground truncate">{c ? c.type : ''} • {new Date(p.createdAt).toLocaleString()}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={p.status === 'posted' ? 'secondary' : p.status === 'scheduled' ? 'outline' : 'destructive'} className="text-[10px]">{p.status}</Badge>
                                    {c?.url && <a className="text-xs underline text-muted-foreground" href={c.url} target="_blank" rel="noreferrer">Open</a>}
                                  </div>
                                </div>
                                {/* Channel-specific buyers */}
                                <div className="mt-2 space-y-1">
                                  {channelLeads.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between text-xs p-2 rounded border">
                                      <div className="min-w-0">
                                        <div className="font-medium truncate">{b.name}</div>
                                        <div className="text-[11px] text-muted-foreground truncate">{b.region}{b.source ? ` • ${b.source}` : ''}</div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <a href={`tel:${b.phone.replace(/\s/g,'')}`} className="underline">Call</a>
                                        {b.email && <a href={`mailto:${b.email}`} className="underline">Email</a>}
                                        {b.sourceUrl && <a href={b.sourceUrl} target="_blank" rel="noreferrer" className="underline">Source</a>}
                                      </div>
                                    </div>
                                  ))}
                                  {channelLeads.length === 0 && (
                                    <div className="text-xs text-muted-foreground">No buyers from this channel yet.</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base">Potential Buyers</CardTitle><CardDescription>People and resellers showing interest</CardDescription></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {lLeads.map((b) => (
                            <div key={b.id} className="p-2 rounded border text-sm">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{b.name}</div>
                                <Badge variant="secondary" className="text-[10px]">{b.status}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">{b.region} • {b.product}</div>
                              {b.message && <div className="text-xs italic mt-1">"{b.message}"</div>}
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <a href={`tel:${b.phone.replace(/\s/g,'')}`} className="inline-flex items-center gap-1"><Phone className="h-3 w-3"/> {b.phone}</a>
                                {b.email && (<a href={`mailto:${b.email}`} className="inline-flex items-center gap-1"><Mail className="h-3 w-3"/> Email</a>)}
                                {b.source && (
                                  <span className="inline-flex items-center gap-1 text-muted-foreground"><ExternalLink className="h-3 w-3"/> {b.source}</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {lLeads.length === 0 && <div className="text-sm text-muted-foreground">No buyers yet.</div>}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader className="pb-2"><CardTitle className="text-base">Offers</CardTitle><CardDescription>Incoming price proposals</CardDescription></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Buyer</TableHead>
                              <TableHead>Offer</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Contact</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lOffers.map((o) => (
                              <TableRow key={o.id}>
                                <TableCell className="font-medium">{o.buyer}</TableCell>
                                <TableCell>{o.price} TND{priceUnitLabel(o.priceUnit)}</TableCell>
                                <TableCell><Badge variant={o.status === 'new' ? 'secondary' : o.status === 'accepted' ? 'default' : 'outline'}>{o.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {o.phone && <a href={`tel:${o.phone.replace(/\s/g,'')}`}><Button size="sm"><Phone className="h-4 w-4 mr-1"/>Call</Button></a>}
                                    {o.email && <a href={`mailto:${o.email}`}><Button size="sm" variant="outline"><Mail className="h-4 w-4 mr-1"/>Email</Button></a>}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {lOffers.length === 0 && (
                              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No offers yet.</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Channels management */}
        <div className="mt-6 space-y-4">
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
        </div>
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

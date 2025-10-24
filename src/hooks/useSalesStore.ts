import { create } from 'zustand';

export type ItemType = 'Crop' | 'Animal' | 'Other';
export type PriceUnit = 'per_kg' | 'per_ton' | 'per_liter' | 'total';
export type QtyUnit = 'kg' | 'ton' | 'L' | 'head' | 'unit';

export interface Listing {
  id: number;
  type: ItemType;
  product: string;
  quantity: number;
  qtyUnit: QtyUnit;
  priceMin: number;
  priceMax: number;
  priceUnit: PriceUnit;
  city: string;
  market: string;
  days: string; // e.g., 'Fri • Sun'
  notes?: string;
  createdAt: string; // ISO
}

export interface BuyerLead {
  id: number;
  name: string;
  region: string;
  product: string;
  message?: string;
  phone: string;
  email?: string;
  source?: string;
  sourceUrl?: string;
  status: 'Hot' | 'Warm' | 'New';
  createdAt: string;
}

export interface Offer {
  id: number;
  market: string;
  city: string;
  product: string;
  price: number;
  priceUnit: PriceUnit;
  buyer: string;
  phone?: string;
  email?: string;
  status: 'new' | 'accepted' | 'declined';
  createdAt: string;
}

export type ChannelType = 'Facebook' | 'WhatsApp' | 'Telegram' | 'SoukTN' | 'Instagram';

export interface Channel {
  id: number;
  name: string; // e.g., Tunisia Agri Group
  type: ChannelType;
  url?: string;
  enabled: boolean;
  createdAt: string;
}

export interface Posting {
  id: number;
  listingId: number;
  channelId: number;
  status: 'scheduled' | 'posted' | 'failed';
  note?: string;
  createdAt: string;
}

interface SalesState {
  listings: Listing[];
  leads: BuyerLead[];
  offers: Offer[];
  channels: Channel[];
  postings: Posting[];
  addListing: (l: Omit<Listing, 'id' | 'createdAt'>) => void;
  removeListing: (id: number) => void;
  addLead: (lead: Omit<BuyerLead, 'id' | 'createdAt'>) => void;
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => void;
  addChannel: (c: Omit<Channel, 'id' | 'createdAt'>) => void;
  toggleChannel: (id: number, enabled: boolean) => void;
  broadcastListing: (listingId: number, channelIds?: number[]) => void;
  seedDemoData: () => void;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_e) {
    // ignore persistence errors in non-browser/test envs
    return;
  }
}

export const useSalesStore = create<SalesState>((set, get) => ({
  listings: (typeof window !== 'undefined' && load<Listing[]>('fh_sales_listings', [])) || [],
  leads: (typeof window !== 'undefined' && load<BuyerLead[]>('fh_sales_leads', [])) || [],
  offers: (typeof window !== 'undefined' && load<Offer[]>('fh_sales_offers', [])) || [],
  channels: (typeof window !== 'undefined' && load<Channel[]>('fh_sales_channels', [])) || [],
  postings: (typeof window !== 'undefined' && load<Posting[]>('fh_sales_postings', [])) || [],
  addListing: (l) => set((s) => {
    const id = Math.max(0, ...s.listings.map((x) => x.id)) + 1;
    const rec: Listing = { ...l, id, createdAt: new Date().toISOString() };
    const next = [...s.listings, rec];
    if (typeof window !== 'undefined') save('fh_sales_listings', next);
    return { listings: next };
  }),
  removeListing: (id) => set((s) => {
    const next = s.listings.filter((x) => x.id !== id);
    if (typeof window !== 'undefined') save('fh_sales_listings', next);
    return { listings: next };
  }),
  addLead: (lead) => set((s) => {
    const id = Math.max(0, ...s.leads.map((x) => x.id)) + 1;
    const rec: BuyerLead = { ...lead, id, createdAt: new Date().toISOString() };
    const next = [rec, ...s.leads];
    if (typeof window !== 'undefined') save('fh_sales_leads', next);
    return { leads: next };
  }),
  addOffer: (offer) => set((s) => {
    const id = Math.max(0, ...s.offers.map((x) => x.id)) + 1;
    const rec: Offer = { ...offer, id, createdAt: new Date().toISOString() };
    const next = [rec, ...s.offers];
    if (typeof window !== 'undefined') save('fh_sales_offers', next);
    return { offers: next };
  }),
  addChannel: (c) => set((s) => {
    const id = Math.max(0, ...s.channels.map((x) => x.id)) + 1;
    const rec: Channel = { ...c, id, createdAt: new Date().toISOString() };
    const next = [...s.channels, rec];
    if (typeof window !== 'undefined') save('fh_sales_channels', next);
    return { channels: next };
  }),
  toggleChannel: (id, enabled) => set((s) => {
    const next = s.channels.map((c) => (c.id === id ? { ...c, enabled } : c));
    if (typeof window !== 'undefined') save('fh_sales_channels', next);
    return { channels: next };
  }),
  broadcastListing: (listingId, channelIds) => {
    const { channels, listings } = get();
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;
    const targets = (channelIds && channelIds.length ? channels.filter((c) => channelIds.includes(c.id)) : channels.filter((c) => c.enabled));
    if (targets.length === 0) return;
    // Create posting records
    const now = new Date().toISOString();
    set((s) => {
      const startId = Math.max(0, ...s.postings.map((p) => p.id));
      const newPostings: Posting[] = targets.map((c, idx) => ({ id: startId + idx + 1, listingId, channelId: c.id, status: 'posted', createdAt: now, note: `Posted to ${c.name}` }));
      const next = [...newPostings, ...s.postings];
      if (typeof window !== 'undefined') save('fh_sales_postings', next);
      return { postings: next };
    });
    // Simulate incoming leads from some channels after a brief delay
    targets.forEach((c, i) => {
      const delayMs = 800 + i * 400;
      setTimeout(() => {
        const probability = c.type === 'Facebook' || c.type === 'SoukTN' ? 0.7 : 0.4;
        if (Math.random() < probability) {
          const name = ['Mohamed', 'Fatima', 'Karim', 'Amal', 'Sami', 'Noura'][Math.floor(Math.random() * 6)] + ' ' + ['A.', 'B.', 'K.', 'T.', 'D.'][Math.floor(Math.random() * 5)];
          const phone = `+216 ${Math.floor(20 + Math.random()*79)} ${Math.floor(100).toString().padStart(3,'0')} ${Math.floor(1000).toString().padStart(3,'0')}`;
          get().addLead({
            name,
            region: listing.city,
            product: listing.product,
            message: `Commented "Interested" on ${c.name}`,
            phone,
            source: `${c.type}${c.url ? ' • ' + c.name : ''}`,
            sourceUrl: c.url,
            status: 'New',
          });
        }
      }, delayMs);
    });
  },
  seedDemoData: () => set((s) => {
    if (s.listings.length || s.leads.length || s.offers.length) return {} as Partial<SalesState>;
    const now = new Date().toISOString();
    const listings: Listing[] = [
      { id: 1, type: 'Crop', product: 'Fresh Tomatoes', quantity: 50, qtyUnit: 'kg', priceMin: 3.0, priceMax: 3.8, priceUnit: 'per_kg', city: 'Sousse', market: 'Souk El Jumaa', days: 'Fri • Sun', notes: 'Pick-up 7-11 AM', createdAt: now },
      { id: 2, type: 'Other', product: 'Olive Oil (extra virgin)', quantity: 20, qtyUnit: 'L', priceMin: 40, priceMax: 48, priceUnit: 'per_liter', city: 'Tunis', market: 'Marché Central', days: 'Sat', notes: 'Bring own containers', createdAt: now },
      { id: 3, type: 'Other', product: 'Dairy Milk (fresh)', quantity: 80, qtyUnit: 'L', priceMin: 1.8, priceMax: 2.2, priceUnit: 'per_liter', city: 'Nabeul', market: 'Souk Nabeul', days: 'Daily', notes: 'Morning only', createdAt: now },
      { id: 4, type: 'Crop', product: 'Durum Wheat', quantity: 200, qtyUnit: 'kg', priceMin: 1.0, priceMax: 1.3, priceUnit: 'per_kg', city: 'Kairouan', market: 'Souk Kairouan', days: 'Thu', createdAt: now },
      { id: 5, type: 'Animal', product: 'Calves (6-8 months)', quantity: 5, qtyUnit: 'head', priceMin: 900, priceMax: 1100, priceUnit: 'total', city: 'Sidi Bouzid', market: 'Weekly Livestock Market', days: 'Mon', createdAt: now },
    ];
    const leads: BuyerLead[] = [
      { id: 1, name: 'Mohamed K.', region: 'Sousse', product: 'Olive Oil', message: 'Interested in bulk order', phone: '+216 22 111 222', email: 'mohamedk@example.com', source: 'Facebook Group • Tunisia Agri', sourceUrl: 'https://facebook.com/groups/tunisia-agri', status: 'Hot', createdAt: now },
      { id: 2, name: 'Fatima B.', region: 'Nabeul', product: 'Dairy Milk', message: 'Weekly delivery possible?', phone: '+216 23 333 444', email: 'fatimab@example.com', source: 'WhatsApp • Local Buyer Circle', status: 'Warm', createdAt: now },
      { id: 3, name: 'Ali T.', region: 'Tunis', product: 'Fresh Tomatoes', message: 'Can you deliver to Tunis?', phone: '+216 55 555 555', email: 'ali.t@example.com', source: 'SoukTN Marketplace', sourceUrl: 'https://souk.tn', status: 'New', createdAt: now },
    ];
    const offers: Offer[] = [
      { id: 1, market: 'Souk El Jumaa', city: 'Sousse', product: 'Fresh Tomatoes', price: 3.3, priceUnit: 'per_kg', buyer: 'Karim A.', phone: '+216 21 222 333', status: 'new', createdAt: now },
      { id: 2, market: 'Marché Central', city: 'Tunis', product: 'Olive Oil (extra virgin)', price: 44, priceUnit: 'per_liter', buyer: 'Boutique La Huile', email: 'contact@huile.tn', status: 'accepted', createdAt: now },
      { id: 3, market: 'Souk Nabeul', city: 'Nabeul', product: 'Dairy Milk (fresh)', price: 1.9, priceUnit: 'per_liter', buyer: 'Amal D.', phone: '+216 97 888 777', status: 'new', createdAt: now },
      { id: 4, market: 'Souk Kairouan', city: 'Kairouan', product: 'Durum Wheat', price: 1.15, priceUnit: 'per_kg', buyer: 'GrainCo', email: 'buy@grainco.tn', status: 'declined', createdAt: now },
    ];
    const channels: Channel[] = [
      { id: 1, name: 'Tunisia Agri (Facebook Group)', type: 'Facebook', url: 'https://facebook.com/groups/tunisia-agri', enabled: true, createdAt: now },
      { id: 2, name: 'Local Buyer Circle (WhatsApp)', type: 'WhatsApp', enabled: true, createdAt: now },
      { id: 3, name: 'Agri Deals TN (Telegram)', type: 'Telegram', enabled: false, createdAt: now },
      { id: 4, name: 'SoukTN Marketplace', type: 'SoukTN', url: 'https://souk.tn', enabled: true, createdAt: now },
    ];
    if (typeof window !== 'undefined') {
      save('fh_sales_listings', listings);
      save('fh_sales_leads', leads);
      save('fh_sales_offers', offers);
      save('fh_sales_channels', channels);
      save('fh_sales_postings', [] as Posting[]);
    }
    return { listings, leads, offers, channels, postings: [] };
  }),
}));

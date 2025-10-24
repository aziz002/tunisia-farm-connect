import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Plus, Edit, Trash2, Activity, AlertTriangle, CheckCircle, Map, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUIStore } from '@/hooks/useStore';

type SensorType = 'Moisture' | 'Flow' | 'Pressure' | 'Temperature';
type SectionStatus = 'watered' | 'needs-water' | 'scheduled';
type ScheduleStatus = 'scheduled' | 'complete';

interface Sensor {
  id: number;
  name: string;
  type: SensorType;
  status: 'active' | 'warning' | 'offline';
  value: string;
  location: string;
  model?: string;
  manufacturer?: string;
  serialId?: string;
  unit?: string;
  installDate?: string; // ISO
  pollingIntervalSec?: number;
}

interface FieldSection {
  id: number;
  name: string;
  cropType: string;
  waterAmount: string;
  status: SectionStatus;
  // Legacy grid positioning (fallback)
  row: number; // 1-based
  col: number; // 1-based
  rowSpan: number;
  colSpan: number;
  // New real-world measurements (meters). If provided, these take precedence.
  xM?: number; // left offset in meters
  yM?: number; // top offset in meters
  widthM?: number; // width in meters
  heightM?: number; // height in meters
  moisture?: number;
}

interface ScheduleItem {
  id: number;
  time: string; // HH:MM
  sectionId: number;
  durationMin: number;
  amountL: number;
  status: ScheduleStatus;
}

const SmartIrrigation = () => {
  const [sensors, setSensors] = useState<Sensor[]>([
    { id: 1, name: 'Soil Moisture A1', type: 'Moisture', status: 'active', value: '45%', location: 'Section A', model: 'SM-200', manufacturer: 'AgriSense', serialId: 'SM-A1-200', unit: '%', installDate: new Date().toISOString().slice(0,10), pollingIntervalSec: 60 },
    { id: 2, name: 'Soil Moisture B2', type: 'Moisture', status: 'warning', value: '28%', location: 'Section B', model: 'SM-200', manufacturer: 'AgriSense', serialId: 'SM-B2-200', unit: '%', installDate: new Date().toISOString().slice(0,10), pollingIntervalSec: 60 },
    { id: 3, name: 'Water Flow Main', type: 'Flow', status: 'active', value: '120 L/min', location: 'Main Line', model: 'WF-10', manufacturer: 'FlowTech', serialId: 'WF-ML-10', unit: 'L/min', installDate: new Date().toISOString().slice(0,10), pollingIntervalSec: 15 },
    { id: 4, name: 'Pressure Monitor', type: 'Pressure', status: 'active', value: '2.5 Bar', location: 'Pump', model: 'PR-5', manufacturer: 'HydroPro', serialId: 'PR-P-5', unit: 'bar', installDate: new Date().toISOString().slice(0,10), pollingIntervalSec: 30 },
  ]);

  const [fieldSections, setFieldSections] = useState<FieldSection[]>([
    // Seed with grid-based layout, plus approximate meter-based geometry based on default field size below
    { id: 1, name: 'Section A', cropType: 'Tomatoes', waterAmount: '25 L/day', status: 'watered', row: 1, col: 1, rowSpan: 2, colSpan: 3, moisture: 45 },
    { id: 2, name: 'Section B', cropType: 'Peppers', waterAmount: '20 L/day', status: 'needs-water', row: 1, col: 4, rowSpan: 1, colSpan: 2, moisture: 28 },
    { id: 3, name: 'Section C', cropType: 'Olives', waterAmount: '15 L/day', status: 'watered', row: 2, col: 4, rowSpan: 1, colSpan: 1, moisture: 38 },
    { id: 4, name: 'Section D', cropType: 'Wheat', waterAmount: '10 L/day', status: 'scheduled', row: 2, col: 5, rowSpan: 1, colSpan: 1, moisture: 33 },
  ]);

  // Field dimensions (stored in meters). User can view/edit in meters or kilometers.
  const [fieldSizeM, setFieldSizeM] = useState<{ widthM: number; heightM: number }>({ widthM: 600, heightM: 400 });
  const [unit, setUnit] = useState<'m' | 'km'>('m');

  const [editingSection, setEditingSection] = useState<FieldSection | null>(null);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [isAddSensorOpen, setIsAddSensorOpen] = useState(false);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: 1, time: '06:00', sectionId: 1, durationMin: 45, amountL: 25, status: 'complete' },
    { id: 2, time: '14:30', sectionId: 2, durationMin: 40, amountL: 20, status: 'scheduled' },
    { id: 3, time: '17:00', sectionId: 4, durationMin: 30, amountL: 10, status: 'scheduled' },
  ]);

  const sectionsById = useMemo(() => Object.fromEntries(fieldSections.map(s => [s.id, s])), [fieldSections]);

  // Blueprint/map visuals and interactions
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [gridStepM, setGridStepM] = useState<number>(20);
  const [drag, setDrag] = useState<
    | {
        id: number;
        type: 'move' | 'resize';
        startXM: number;
        startYM: number;
        startWidthM: number;
        startHeightM: number;
        pointerStartXM: number;
        pointerStartYM: number;
      }
    | null
  >(null);
  const [didDrag, setDidDrag] = useState(false);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  const snap = (m: number) => (gridStepM > 0 ? Math.round(m / gridStepM) * gridStepM : m);
  const pointerToMeters = (e: PointerEvent | React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { xM: 0, yM: 0 };
    const xRatio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const yRatio = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    return { xM: xRatio * fieldSizeM.widthM, yM: yRatio * fieldSizeM.heightM };
  };

  // Listen for global UI actions (agentic assistant)
  const { lastAction, clearAction } = useUIStore();
  useEffect(() => {
    if (!lastAction) return;
    if (lastAction.type === 'openAddSensor') setIsAddSensorOpen(true);
    if (lastAction.type === 'openAddSection') setIsAddSectionOpen(true);
    if (lastAction.type === 'openScheduleEditor') setIsEditScheduleOpen(true);
    // Clear so it doesn't re-trigger
    clearAction();
  }, [lastAction, clearAction]);

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
          {/* Sensors List */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Sensors
                </CardTitle>
                <Dialog open={isAddSensorOpen} onOpenChange={setIsAddSensorOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Sensor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Add New Sensor</DialogTitle>
                      <DialogDescription>Add a new sensor to monitor your irrigation system</DialogDescription>
                    </DialogHeader>
                    <AddSensorForm
                      onCancel={() => setIsAddSensorOpen(false)}
                      onSave={(sensor) => {
                        setSensors((prev) => [...prev, { ...sensor, id: Math.max(0, ...prev.map(s => s.id)) + 1 }]);
                        setIsAddSensorOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-3">
                {sensors.map((sensor) => (
                  <div 
                    key={sensor.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    {getStatusIcon(sensor.status)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{sensor.name}</div>
                      <div className="text-xs text-muted-foreground">{sensor.location} • {sensor.type} • {sensor.model}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{sensor.value}</div>
                      {getStatusBadge(sensor.status)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" onClick={() => setSensors(prev => prev.filter(s => s.id !== sensor.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Field Blueprint (Map) */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary"/> Field Map</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Field size controls */}
                  <div className="flex flex-wrap items-center gap-2 mr-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Width</Label>
                      <Input
                        className="h-8 w-20"
                        type="number"
                        min={1}
                        value={unit === 'km' ? (fieldSizeM.widthM / 1000) : fieldSizeM.widthM}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setFieldSizeM((prev) => ({ ...prev, widthM: unit === 'km' ? v * 1000 : v }));
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Height</Label>
                      <Input
                        className="h-8 w-20"
                        type="number"
                        min={1}
                        value={unit === 'km' ? (fieldSizeM.heightM / 1000) : fieldSizeM.heightM}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setFieldSizeM((prev) => ({ ...prev, heightM: unit === 'km' ? v * 1000 : v }));
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Unit</Label>
                      <Select value={unit} onValueChange={(v) => setUnit(v as 'm' | 'km')}>
                        <SelectTrigger className="h-8 w-[72px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="km">km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Grid</Label>
                      <Button size="sm" variant={showGrid ? 'default' : 'outline'} className="h-8 px-2" onClick={() => setShowGrid(v => !v)}>
                        {showGrid ? 'On' : 'Off'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Step</Label>
                      <Select value={String(gridStepM)} onValueChange={(v) => setGridStepM(Number(v))}>
                        <SelectTrigger className="h-8 w-[90px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">{unit === 'km' ? '0.01 km' : '10 m'}</SelectItem>
                          <SelectItem value="20">{unit === 'km' ? '0.02 km' : '20 m'}</SelectItem>
                          <SelectItem value="50">{unit === 'km' ? '0.05 km' : '50 m'}</SelectItem>
                          <SelectItem value="100">{unit === 'km' ? '0.1 km' : '100 m'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Rulers</Label>
                      <Button size="sm" variant={showRulers ? 'default' : 'outline'} className="h-8 px-2" onClick={() => setShowRulers(v => !v)}>
                        {showRulers ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </div>
                  <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2"><Plus className="h-4 w-4"/> Add Section</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Add Field Section</DialogTitle>
                        <DialogDescription>Define a new section and its position on the map.</DialogDescription>
                      </DialogHeader>
                      <SectionForm
                        unit={unit}
                        fieldSizeM={fieldSizeM}
                        onCancel={() => setIsAddSectionOpen(false)}
                        onSave={(sec) => {
                          setFieldSections((prev) => [...prev, { ...sec, id: Math.max(0, ...prev.map(s => s.id)) + 1 }]);
                          setIsAddSectionOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Field with external rulers and inner canvas */}
              <div className="relative w-full flex-1">
                <div className="grid h-full w-full" style={{ gridTemplateColumns: '24px 1fr', gridTemplateRows: '24px 1fr' }}>
                  {/* Top-left corner */}
                  <div />
                  {/* Top ruler */}
                  {showRulers ? (
                    <div className="relative bg-background/70 border-b border-border text-[10px] text-muted-foreground">
                      {Array.from({ length: Math.floor(fieldSizeM.widthM / gridStepM) + 1 }).map((_, i) => {
                        const leftPct = (i * gridStepM / fieldSizeM.widthM) * 100;
                        const label = unit === 'km' ? (i * gridStepM / 1000).toFixed(2) : String(i * gridStepM);
                        return (
                          <div key={i} className="absolute top-0 h-full" style={{ left: `${leftPct}%` }}>
                            <div className="w-px h-full bg-border" />
                            <div className="absolute top-0 mt-0.5 -translate-x-1/2">{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div />
                  )}
                  {/* Left ruler */}
                  {showRulers ? (
                    <div className="relative bg-background/70 border-r border-border text-[10px] text-muted-foreground">
                      {Array.from({ length: Math.floor(fieldSizeM.heightM / gridStepM) + 1 }).map((_, i) => {
                        const topPct = (i * gridStepM / fieldSizeM.heightM) * 100;
                        const label = unit === 'km' ? (i * gridStepM / 1000).toFixed(2) : String(i * gridStepM);
                        return (
                          <div key={i} className="absolute left-0 w-full" style={{ top: `${topPct}%` }}>
                            <div className="h-px w-full bg-border" />
                            <div className="absolute left-0 ml-0.5 -translate-y-1/2">{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div />
                  )}
                  {/* Canvas */}
                  <div
                    ref={canvasRef}
                    className="relative rounded-lg border border-border bg-muted/30 overflow-hidden"
                    onPointerMove={(e) => {
                      if (!drag) return;
                      const { xM, yM } = pointerToMeters(e);
                      setDidDrag(true);
                      setFieldSections((prev) => prev.map((s) => {
                        if (s.id !== drag.id) return s;
                        let x = s.xM ?? ((s.col - 1) / 6) * fieldSizeM.widthM;
                        let y = s.yM ?? ((s.row - 1) / 2) * fieldSizeM.heightM;
                        let w = s.widthM ?? (s.colSpan / 6) * fieldSizeM.widthM;
                        let h = s.heightM ?? (s.rowSpan / 2) * fieldSizeM.heightM;
                        if (drag.type === 'move') {
                          const dx = xM - drag.pointerStartXM;
                          const dy = yM - drag.pointerStartYM;
                          x = snap(clamp(drag.startXM + dx, 0, fieldSizeM.widthM - w));
                          y = snap(clamp(drag.startYM + dy, 0, fieldSizeM.heightM - h));
                        } else {
                          const newW = snap(clamp(drag.startWidthM + (xM - drag.pointerStartXM), gridStepM, fieldSizeM.widthM - (s.xM ?? drag.startXM)));
                          const newH = snap(clamp(drag.startHeightM + (yM - drag.pointerStartYM), gridStepM, fieldSizeM.heightM - (s.yM ?? drag.startYM)));
                          w = newW;
                          h = newH;
                        }
                        return { ...s, xM: x, yM: y, widthM: w, heightM: h };
                      }));
                    }}
                    onPointerUp={() => {
                      setDrag(null);
                      setTimeout(() => setDidDrag(false), 0);
                    }}
                  >
                    {/* Grid overlay */}
                    {showGrid && (
                      <>
                        {Array.from({ length: Math.floor(fieldSizeM.widthM / gridStepM) + 1 }).map((_, i) => {
                          const leftPct = (i * gridStepM / fieldSizeM.widthM) * 100;
                          return <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-border/50" style={{ left: `${leftPct}%` }} />;
                        })}
                        {Array.from({ length: Math.floor(fieldSizeM.heightM / gridStepM) + 1 }).map((_, i) => {
                          const topPct = (i * gridStepM / fieldSizeM.heightM) * 100;
                          return <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-border/50" style={{ top: `${topPct}%` }} />;
                        })}
                      </>
                    )}
                    {/* Render sections */}
                    {fieldSections.map((section) => {
                  const hasMeters =
                    section.xM !== undefined && section.yM !== undefined && section.widthM !== undefined && section.heightM !== undefined;

                  // Fallback grid-to-percent mapping
                  const totalCols = 6;
                  const totalRows = Math.max(
                    1,
                    ...fieldSections.map((s) => (s.row || 1) + (s.rowSpan || 1) - 1)
                  );

                  const leftPct = hasMeters
                    ? ((section.xM as number) / fieldSizeM.widthM) * 100
                    : ((section.col - 1) / totalCols) * 100;
                  const topPct = hasMeters
                    ? ((section.yM as number) / fieldSizeM.heightM) * 100
                    : ((section.row - 1) / totalRows) * 100;
                  const widthPct = hasMeters
                    ? ((section.widthM as number) / fieldSizeM.widthM) * 100
                    : (section.colSpan / totalCols) * 100;
                  const heightPct = hasMeters
                    ? ((section.heightM as number) / fieldSizeM.heightM) * 100
                    : (section.rowSpan / totalRows) * 100;

                  const style: React.CSSProperties = {
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                  };

                  return (
                    <div
                      key={section.id}
                      style={style}
                      onPointerDown={(e) => {
                        // Start move drag
                        const { xM, yM } = pointerToMeters(e);
                        const sx = section.xM ?? ((section.col - 1) / totalCols) * fieldSizeM.widthM;
                        const sy = section.yM ?? ((section.row - 1) / totalRows) * fieldSizeM.heightM;
                        const sw = section.widthM ?? (section.colSpan / totalCols) * fieldSizeM.widthM;
                        const sh = section.heightM ?? (section.rowSpan / totalRows) * fieldSizeM.heightM;
                        setDrag({ id: section.id, type: 'move', startXM: sx, startYM: sy, startWidthM: sw, startHeightM: sh, pointerStartXM: xM, pointerStartYM: yM });
                        setDidDrag(false);
                      }}
                      onClick={(e) => {
                        if (didDrag) { e.preventDefault(); e.stopPropagation(); return; }
                        setEditingSection(section);
                      }}
                      className={`relative p-3 rounded-md border-2 transition-all cursor-move hover:shadow-md ${
                        section.status === 'watered'
                          ? 'border-primary bg-primary/10'
                          : section.status === 'needs-water'
                          ? 'border-secondary bg-secondary/10'
                          : 'border-border bg-card'
                      }`}
                    >
                      {/* Status icon */}
                      <div className="absolute right-2 top-2">{getStatusIcon(section.status)}</div>
                      {/* Centered crop name */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-foreground/90 font-semibold text-base md:text-lg text-center px-2">
                          {section.cropType || '—'}
                        </div>
                      </div>
                      {/* Metadata */}
                      <div className="absolute left-2 bottom-2 text-[11px] text-muted-foreground">
                        {section.name}
                      </div>
                      <div className="absolute right-2 bottom-2 text-[11px] text-muted-foreground">
                        {section.waterAmount} • {section.moisture ?? '--'}%
                      </div>
                      {/* Resize handle */}
                      <div
                        className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 h-3 w-3 bg-primary rounded-sm cursor-se-resize shadow"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          const { xM, yM } = pointerToMeters(e);
                          const sx = section.xM ?? ((section.col - 1) / totalCols) * fieldSizeM.widthM;
                          const sy = section.yM ?? ((section.row - 1) / totalRows) * fieldSizeM.heightM;
                          const sw = section.widthM ?? (section.colSpan / totalCols) * fieldSizeM.widthM;
                          const sh = section.heightM ?? (section.rowSpan / totalRows) * fieldSizeM.heightM;
                          setDrag({ id: section.id, type: 'resize', startXM: sx, startYM: sy, startWidthM: sw, startHeightM: sh, pointerStartXM: xM, pointerStartYM: yM });
                          setDidDrag(false);
                        }}
                      />
                    </div>
                  );
                })}
                  </div>
                </div>
              </div>

              {/* Edit Section Dialog */}
              <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Edit Section</DialogTitle>
                    <DialogDescription>Update crop, water amount, and map position.</DialogDescription>
                  </DialogHeader>
                  {editingSection && (
                    <SectionForm
                      unit={unit}
                      fieldSizeM={fieldSizeM}
                      initial={editingSection}
                      onCancel={() => setEditingSection(null)}
                      onDelete={() => { setFieldSections(prev => prev.filter(s => s.id !== editingSection.id)); setEditingSection(null);} }
                      onSave={(updated) => {
                        setFieldSections(prev => prev.map(s => s.id === editingSection.id ? { ...updated, id: s.id } : s));
                        setEditingSection(null);
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Irrigation Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today's Irrigation Schedule</CardTitle>
              <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Edit Schedule</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Today's Schedule</DialogTitle>
                    <DialogDescription>Adjust times, sections, duration and amount.</DialogDescription>
                  </DialogHeader>
                  <ScheduleEditor
                    items={schedule}
                    sections={fieldSections}
                    onChange={setSchedule}
                    onDone={() => setIsEditScheduleOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedule.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                  <div className="w-24 text-center">
                    <div className="text-sm font-medium">{item.time}</div>
                    <Badge variant={item.status === 'complete' ? 'default' : 'outline'} className="mt-1">
                      {item.status === 'complete' ? 'Complete' : 'Scheduled'}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{sectionsById[item.sectionId]?.name} - {sectionsById[item.sectionId]?.cropType}</div>
                    <div className="text-xs text-muted-foreground">Duration: {item.durationMin} min • Amount: {item.amountL} L</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SmartIrrigation;

// ===== Helper Forms =====

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SectionForm({
  initial,
  onSave,
  onCancel,
  onDelete,
  unit = 'm',
  fieldSizeM,
}: {
  initial?: FieldSection;
  onSave: (section: Omit<FieldSection, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  unit?: 'm' | 'km';
  fieldSizeM?: { widthM: number; heightM: number };
}) {
  const [form, setForm] = useState<Omit<FieldSection, 'id'>>({
    name: initial?.name || '',
    cropType: initial?.cropType || '',
    waterAmount: initial?.waterAmount || '20 L/day',
    status: initial?.status || 'scheduled',
    row: initial?.row || 1,
    col: initial?.col || 1,
    rowSpan: initial?.rowSpan || 1,
    colSpan: initial?.colSpan || 2,
    xM: initial?.xM,
    yM: initial?.yM,
    widthM: initial?.widthM,
    heightM: initial?.heightM,
    moisture: initial?.moisture ?? undefined,
  });

  // Position input mode
  const [mode, setMode] = useState<'grid' | 'measurements'>(
    initial && initial.xM !== undefined ? 'measurements' : 'grid'
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Section E" />
        </Field>
        <Field label="Crop type">
          <Input value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })} placeholder="Tomatoes" />
        </Field>
        <Field label="Water amount">
          <Input value={form.waterAmount} onChange={(e) => setForm({ ...form, waterAmount: e.target.value })} placeholder="20 L/day" />
        </Field>
        <Field label="Status">
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as SectionStatus })}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="watered">Watered</SelectItem>
              <SelectItem value="needs-water">Needs Water</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Field label="Position input">
          <Select value={mode} onValueChange={(v) => setMode(v as 'grid' | 'measurements')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid (rows/cols)</SelectItem>
              <SelectItem value="measurements">Measurements ({unit})</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {mode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Row">
              <Input type="number" min={1} value={form.row} onChange={(e) => setForm({ ...form, row: Number(e.target.value) })} />
            </Field>
            <Field label="Col">
              <Input type="number" min={1} value={form.col} onChange={(e) => setForm({ ...form, col: Number(e.target.value) })} />
            </Field>
            <Field label="Row span">
              <Input type="number" min={1} value={form.rowSpan} onChange={(e) => setForm({ ...form, rowSpan: Number(e.target.value) })} />
            </Field>
            <Field label="Col span">
              <Input type="number" min={1} value={form.colSpan} onChange={(e) => setForm({ ...form, colSpan: Number(e.target.value) })} />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label={`X (${unit})`}>
              <Input
                type="number"
                min={0}
                step={unit === 'km' ? 0.001 : 1}
                value={unit === 'km' ? (form.xM ?? 0) / 1000 : (form.xM ?? 0)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setForm({ ...form, xM: unit === 'km' ? v * 1000 : v });
                }}
              />
            </Field>
            <Field label={`Y (${unit})`}>
              <Input
                type="number"
                min={0}
                step={unit === 'km' ? 0.001 : 1}
                value={unit === 'km' ? (form.yM ?? 0) / 1000 : (form.yM ?? 0)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setForm({ ...form, yM: unit === 'km' ? v * 1000 : v });
                }}
              />
            </Field>
            <Field label={`Width (${unit})`}>
              <Input
                type="number"
                min={1}
                step={unit === 'km' ? 0.001 : 1}
                value={unit === 'km' ? (form.widthM ?? 0) / 1000 : (form.widthM ?? 0)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setForm({ ...form, widthM: unit === 'km' ? v * 1000 : v });
                }}
              />
            </Field>
            <Field label={`Height (${unit})`}>
              <Input
                type="number"
                min={1}
                step={unit === 'km' ? 0.001 : 1}
                value={unit === 'km' ? (form.heightM ?? 0) / 1000 : (form.heightM ?? 0)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setForm({ ...form, heightM: unit === 'km' ? v * 1000 : v });
                }}
              />
            </Field>
            {fieldSizeM && (
              <div className="md:col-span-4 text-xs text-muted-foreground">
                Field size: {unit === 'km' ? fieldSizeM.widthM / 1000 : fieldSizeM.widthM} × {unit === 'km' ? fieldSizeM.heightM / 1000 : fieldSizeM.heightM} {unit}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Moisture % (optional)">
          <Input type="number" min={0} max={100} value={form.moisture ?? ''} onChange={(e) => setForm({ ...form, moisture: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </Field>
      </div>
      <div className="flex justify-between gap-2">
        {onDelete && (
          <Button variant="destructive" onClick={onDelete} className="gap-2"><Trash2 className="h-4 w-4"/> Delete</Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={onCancel} className="gap-2"><X className="h-4 w-4"/> Cancel</Button>
          <Button onClick={() => onSave(form)} className="gap-2"><Save className="h-4 w-4"/> Save</Button>
        </div>
      </div>
    </div>
  );
}

function AddSensorForm({ onSave, onCancel }: { onSave: (sensor: Omit<Sensor, 'id'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<Sensor, 'id'>>({
    name: '',
    type: 'Moisture',
    status: 'active',
    value: '0',
    location: '',
    model: '',
    manufacturer: '',
    serialId: '',
    unit: '',
    installDate: new Date().toISOString().slice(0, 10),
    pollingIntervalSec: 60,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Sensor name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Soil Moisture A1" />
        </Field>
        <Field label="Type">
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as SensorType })}>
            <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="Moisture">Soil Moisture</SelectItem>
              <SelectItem value="Flow">Water Flow</SelectItem>
              <SelectItem value="Pressure">Pressure</SelectItem>
              <SelectItem value="Temperature">Temperature</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Section A" />
        </Field>
        <Field label="Unit">
          <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="% or L/min or bar" />
        </Field>
        <Field label="Model">
          <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="SM-200" />
        </Field>
        <Field label="Manufacturer">
          <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} placeholder="AgriSense" />
        </Field>
        <Field label="Serial ID">
          <Input value={form.serialId} onChange={(e) => setForm({ ...form, serialId: e.target.value })} placeholder="SM-A1-200" />
        </Field>
        <Field label="Install date">
          <Input type="date" value={form.installDate} onChange={(e) => setForm({ ...form, installDate: e.target.value })} />
        </Field>
        <Field label="Polling interval (sec)">
          <Input type="number" min={5} value={form.pollingIntervalSec} onChange={(e) => setForm({ ...form, pollingIntervalSec: Number(e.target.value) })} />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="gap-2"><X className="h-4 w-4"/> Cancel</Button>
        <Button onClick={() => onSave(form)} className="gap-2"><Save className="h-4 w-4"/> Save</Button>
      </div>
    </div>
  );
}

function ScheduleEditor({ items, sections, onChange, onDone }: { items: ScheduleItem[]; sections: FieldSection[]; onChange: (v: ScheduleItem[]) => void; onDone: () => void }) {
  const [local, setLocal] = useState<ScheduleItem[]>(items);

  const update = (idx: number, patch: Partial<ScheduleItem>) => {
    setLocal((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
        {local.map((item, idx) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border rounded-md p-3">
            <Field label="Time">
              <Input type="time" value={item.time} onChange={(e) => update(idx, { time: e.target.value })} />
            </Field>
            <Field label="Section">
              <Select value={String(item.sectionId)} onValueChange={(v) => update(idx, { sectionId: Number(v) })}>
                <SelectTrigger><SelectValue placeholder="Choose section"/></SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Duration (min)">
              <Input type="number" min={1} value={item.durationMin} onChange={(e) => update(idx, { durationMin: Number(e.target.value) })} />
            </Field>
            <Field label="Amount (L)">
              <Input type="number" min={1} value={item.amountL} onChange={(e) => update(idx, { amountL: Number(e.target.value) })} />
            </Field>
            <Field label="Status">
              <Select value={item.status} onValueChange={(v) => update(idx, { status: v as ScheduleStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-5 flex justify-end">
              <Button variant="outline" className="text-muted-foreground hover:text-foreground" onClick={() => setLocal(prev => prev.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4"/></Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" className="gap-2" onClick={() => setLocal(prev => [...prev, { id: Math.max(0, ...prev.map(i => i.id)) + 1, time: '06:00', sectionId: sections[0]?.id ?? 1, durationMin: 30, amountL: 10, status: 'scheduled' }])}><Plus className="h-4 w-4"/> Add item</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDone}><X className="h-4 w-4"/> Cancel</Button>
          <Button onClick={() => { onChange(local); onDone(); }} className="gap-2"><Save className="h-4 w-4"/> Save</Button>
        </div>
      </div>
    </div>
  );
}
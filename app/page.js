'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, CreditCard, FolderKanban, BarChart3, LogOut, Plus, Pencil, Trash2,
  CheckCircle2, Clock, AlertTriangle, DollarSign, TrendingUp, Wallet, Search, RefreshCw, Trophy,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n || 0);

async function api(path, options = {}) {
  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      toast.success('Bienvenido!');
      onLogin();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 mb-4">
            <Trophy className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AcademiaPro</h1>
          <p className="text-muted-foreground mt-1">Sistema de gestión para academias de fútbol</p>
        </div>
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales de administrador</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="u">Usuario</Label>
                <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p">Contraseña</Label>
                <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Credenciales por defecto: admin / admin123 (configurable en .env)
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Sidebar({ view, setView, onLogout }) {
  const items = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'players', label: 'Jugadores', icon: Users },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'categories', label: 'Categorías', icon: FolderKanban },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
  ];
  return (
    <aside className="w-64 bg-white border-r flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold leading-tight">AcademiaPro</h1>
            <p className="text-xs text-muted-foreground">Gestión integral</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {it.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    blue: 'bg-blue-50 text-blue-700',
  };
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const s = await api('stats');
      setStats(s);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  if (loading || !stats) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;

  const collectionRate = stats.monthExpected > 0 ? Math.round((stats.monthCollected / stats.monthExpected) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Panel de control</h2>
          <p className="text-muted-foreground text-sm">Resumen de {MONTHS_ES[stats.currentMonth - 1]} {stats.currentYear}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Actualizar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Recaudado este mes" value={fmt(stats.monthCollected)} sublabel={`de ${fmt(stats.monthExpected)} esperado`} color="emerald" />
        <StatCard icon={AlertTriangle} label="Adeudos del mes" value={fmt(stats.monthPending)} sublabel={`${collectionRate}% cobrado`} color="amber" />
        <StatCard icon={DollarSign} label="Total histórico cobrado" value={fmt(stats.totalCollected)} color="blue" />
        <StatCard icon={Users} label="Jugadores activos" value={stats.activePlayers} sublabel={`de ${stats.totalPlayers} totales`} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recaudación últimos 6 meses</CardTitle>
            <CardDescription>Cobrado vs pendiente</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={stats.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="collected" name="Cobrado" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pending" name="Pendiente" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top deudores</CardTitle>
            <CardDescription>Jugadores con mayor adeudo</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topDebtors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No hay adeudos</p>
            ) : (
              <ul className="space-y-3">
                {stats.topDebtors.map((d) => (
                  <li key={d.player_id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-semibold text-sm shrink-0">
                        {d.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.count} mes(es)</p>
                      </div>
                    </div>
                    <span className="font-bold text-rose-600">{fmt(d.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CategoriesView() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', monthly_fee: 500, color: '#22c55e' });

  const load = async () => {
    try { setItems(await api('categories')); } catch (e) { toast.error(e.message); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', monthly_fee: 500, color: '#22c55e' }); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, monthly_fee: c.monthly_fee, color: c.color }); setOpen(true); };

  const save = async () => {
    try {
      if (editing) {
        await api(`categories/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success('Categoría actualizada');
      } else {
        await api('categories', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Categoría creada');
      }
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
  };
  const remove = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try { await api(`categories/${id}`, { method: 'DELETE' }); toast.success('Eliminada'); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categorías</h2>
          <p className="text-muted-foreground text-sm">Define grupos por edad y cuota mensual</p>
        </div>
        <Button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Nueva categoría</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: c.color }} />
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">Cuota: {fmt(c.monthly_fee)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">Sin categorías. Crea una para empezar.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
            <DialogDescription>Por ejemplo: Sub-10, Sub-12, Primera fuerza</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sub-12" />
            </div>
            <div className="space-y-2">
              <Label>Cuota mensual</Label>
              <Input type="number" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-24" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-emerald-600 hover:bg-emerald-700">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlayersView() {
  const [players, setPlayers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    try {
      const [p, c] = await Promise.all([api('players'), api('categories')]);
      setPlayers(p); setCategories(c);
    } catch (e) { toast.error(e.message); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', category_id: '', phone: '', parent_name: '', birthdate: '', monthly_fee_override: '', active: true }); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p, monthly_fee_override: p.monthly_fee_override ?? '' }); setOpen(true); };

  const save = async () => {
    try {
      if (!form.name) return toast.error('Nombre requerido');
      if (editing) {
        await api(`players/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success('Jugador actualizado');
      } else {
        await api('players', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Jugador creado');
      }
      setOpen(false); load();
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar jugador y todos sus pagos?')) return;
    try { await api(`players/${id}`, { method: 'DELETE' }); toast.success('Eliminado'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return players.filter((p) => p.name.toLowerCase().includes(q) || (p.parent_name || '').toLowerCase().includes(q));
  }, [players, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Jugadores</h2>
          <p className="text-muted-foreground text-sm">{players.length} registrados · {players.filter((p) => p.active !== false).length} activos</p>
        </div>
        <Button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Nuevo jugador</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o padre..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jugador</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Cuota</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                      {p.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {p.category ? (
                    <Badge variant="outline" style={{ borderColor: p.category.color, color: p.category.color }}>{p.category.name}</Badge>
                  ) : <span className="text-muted-foreground text-sm">—</span>}
                </TableCell>
                <TableCell className="text-sm">{p.parent_name || '—'}</TableCell>
                <TableCell className="text-sm">{p.phone || '—'}</TableCell>
                <TableCell className="text-sm">
                  {p.monthly_fee_override != null ? fmt(p.monthly_fee_override) : (p.category ? fmt(p.category.monthly_fee) : '—')}
                </TableCell>
                <TableCell>
                  {p.active !== false ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Activo</Badge> : <Badge variant="secondary">Inactivo</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No hay jugadores</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar jugador' : 'Nuevo jugador'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Nombre completo *</Label>
              <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={form.category_id || ''} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha de nacimiento</Label>
              <Input type="date" value={form.birthdate || ''} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nombre del tutor</Label>
              <Input value={form.parent_name || ''} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Cuota personalizada (opcional)</Label>
              <Input type="number" placeholder="Dejar vacío para usar la de la categoría" value={form.monthly_fee_override ?? ''} onChange={(e) => setForm({ ...form, monthly_fee_override: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <input type="checkbox" id="active" checked={form.active !== false} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <Label htmlFor="active">Jugador activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-emerald-600 hover:bg-emerald-700">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PaymentsView() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [status, setStatus] = useState('all');
  const [payments, setPayments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    mode: 'payment',
    player_id: '',
    concept: 'Mensualidad',
    amount: 500,
    payment_method: 'Efectivo',
    account: 'Ale',
    notes: '',
    months: [String(now.getMonth() + 1)],
  });

  const accountOptions = form.payment_method === 'Transferencia'
    ? ['Beto BBVA', 'Ale MercadoPago', 'Tere Banorte']
    : ['Ale', 'Tere', 'Beto'];

  const getPlayerFee = (player) => {
    if (!player) return 0;
    if (player.monthly_fee_override !== null && player.monthly_fee_override !== undefined && player.monthly_fee_override !== '') {
      return Number(player.monthly_fee_override) || 0;
    }
    return Number(player.category?.monthly_fee) || 0;
  };

  const getPaymentExpected = (payment) => Number(payment.expected_amount ?? payment.amount ?? 0);
  const getPaymentPaid = (payment) => payment.status === 'pending' ? 0 : Number(payment.amount || 0);
  const getPaymentPending = (payment) => Math.max(0, getPaymentExpected(payment) - getPaymentPaid(payment));

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ year: String(year) });
      if (month !== 'all') params.set('month', String(month));
      if (status !== 'all') params.set('status', status);
      const [playersData, paymentsData] = await Promise.all([
        api('players'),
        api(`payments?${params.toString()}`),
      ]);
      setPlayers(playersData);
      setPayments(paymentsData);
      if (!form.player_id && playersData[0]?.id) {
        setForm((f) => ({ ...f, player_id: playersData[0].id }));
      }
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [month, year, status]);

  const selectedPlayer = players.find((p) => p.id === form.player_id);
  const selectedMonths = form.months?.length ? form.months.map(Number) : [Number(month) || now.getMonth() + 1];

  const toggleMonth = (value) => {
    setForm((f) => {
      const exists = f.months.includes(String(value));
      const months = exists ? f.months.filter((m) => m !== String(value)) : [...f.months, String(value)];
      return { ...f, months: months.length ? months : [String(value)] };
    });
  };

  const saveManual = async () => {
    if (!form.player_id) return toast.error('Selecciona un jugador');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Captura un monto válido');
    setSaving(true);
    try {
      const totalAmount = Number(form.amount) || 0;
      const amountPerMonth = totalAmount / selectedMonths.length;
      const fee = getPlayerFee(selectedPlayer);

      for (const m of selectedMonths) {
        const expected = form.concept === 'Mensualidad' ? fee : amountPerMonth;
        const statusAuto = form.mode === 'charge'
          ? 'pending'
          : (form.concept === 'Mensualidad' && fee > 0 && amountPerMonth < fee ? 'partial' : 'paid');

        await api('payments', {
          method: 'POST',
          body: JSON.stringify({
            player_id: form.player_id,
            concept: form.concept,
            month: m,
            year,
            amount: Number(amountPerMonth.toFixed(2)),
            expected_amount: Number((expected || amountPerMonth).toFixed(2)),
            status: statusAuto,
            payment_method: form.mode === 'charge' ? '' : form.payment_method,
            account: form.mode === 'charge' ? '' : form.account,
            notes: form.notes,
          }),
        });
      }

      toast.success(form.mode === 'charge' ? 'Cargo pendiente creado' : 'Pago registrado');
      setForm((f) => ({ ...f, amount: selectedPlayer ? getPlayerFee(selectedPlayer) || 500 : 500, notes: '' }));
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const generate = async () => {
    try {
      const r = await api('payments/generate', { method: 'POST', body: JSON.stringify({ month: Number(month) || now.getMonth() + 1, year }) });
      toast.success(`Generados ${r.created} cargos pendientes (${r.skipped} ya existían)`);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const markPaid = async (p) => {
    try {
      await api(`payments/${p.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'paid',
          amount: getPaymentExpected(p),
          payment_method: p.payment_method || 'Efectivo',
          account: p.account || 'Ale',
        }),
      });
      toast.success('Marcado como pagado');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const markPending = async (p) => {
    try {
      await api(`payments/${p.id}`, { method: 'PUT', body: JSON.stringify({ status: 'pending', amount: getPaymentExpected(p), payment_method: '', account: '' }) });
      toast.success('Marcado como pendiente');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar este movimiento?')) return;
    try { await api(`payments/${id}`, { method: 'DELETE' }); toast.success('Eliminado'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const totals = useMemo(() => {
    const collected = payments.reduce((s, p) => s + getPaymentPaid(p), 0);
    const pending = payments.reduce((s, p) => s + getPaymentPending(p), 0);
    return { collected, pending, total: collected + pending };
  }, [payments]);

  useEffect(() => {
    const p = players.find((x) => x.id === form.player_id);
    if (p && form.concept === 'Mensualidad') {
      const fee = getPlayerFee(p);
      if (fee) setForm((f) => ({ ...f, amount: fee }));
    }
  }, [form.player_id, form.concept, players]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Pagos y cargos</h2>
          <p className="text-muted-foreground text-sm">Registro manual CEFOR: mensualidad, arbitraje, transporte, uniforme, torneo e inscripción</p>
        </div>
        <Button onClick={generate} variant="outline"><Plus className="w-4 h-4 mr-2" />Generar mensualidad del mes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo movimiento</CardTitle>
          <CardDescription>Registra pagos reales o crea cargos pendientes por jugador.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de movimiento</Label>
              <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Pago recibido</SelectItem>
                  <SelectItem value="charge">Cargo pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Jugador</Label>
              <Select value={form.player_id} onValueChange={(v) => setForm({ ...form, player_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona jugador" /></SelectTrigger>
                <SelectContent>
                  {players.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} {p.category?.name ? `(${p.category.name})` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Concepto</Label>
              <Select value={form.concept} onValueChange={(v) => setForm({ ...form, concept: v, amount: v === 'Uniforme' ? 3000 : form.amount })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mensualidad">Mensualidad</SelectItem>
                  <SelectItem value="Arbitraje">Arbitraje</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
                  <SelectItem value="Uniforme">Uniforme</SelectItem>
                  <SelectItem value="Torneo">Torneo</SelectItem>
                  <SelectItem value="Inscripción">Inscripción</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Año</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[2024, 2025, 2026, 2027].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monto total</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mes o meses que cubre</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {MONTHS_ES.map((m, i) => (
                <label key={m} className={`border rounded-lg px-3 py-2 text-sm cursor-pointer ${form.months.includes(String(i + 1)) ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white'}`}>
                  <input type="checkbox" className="mr-2" checked={form.months.includes(String(i + 1))} onChange={() => toggleMonth(i + 1)} />
                  {m}
                </label>
              ))}
            </div>
          </div>

          {form.mode === 'payment' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Método</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v, account: v === 'Transferencia' ? 'Beto BBVA' : 'Ale' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cuenta / responsable</Label>
                <Select value={form.account} onValueChange={(v) => setForm({ ...form, account: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{accountOptions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Opcional" />
              </div>
            </div>
          )}

          {form.mode === 'charge' && (
            <div className="space-y-2">
              <Label>Notas del cargo</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Opcional" />
            </div>
          )}

          <Button onClick={saveManual} disabled={saving || players.length === 0} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? 'Guardando...' : form.mode === 'charge' ? 'Crear cargo pendiente' : 'Guardar pago'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Ver mes</Label>
          <Select value={String(month)} onValueChange={(v) => setMonth(v === 'all' ? 'all' : Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {MONTHS_ES.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Estado</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Actualizar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Cobrado</p><p className="text-2xl font-bold text-emerald-600">{fmt(totals.collected)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pendiente</p><p className="text-2xl font-bold text-amber-600">{fmt(totals.pending)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total esperado</p><p className="text-2xl font-bold">{fmt(totals.total)}</p></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jugador</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Método / cuenta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.player?.name || '—'}</TableCell>
                <TableCell>{p.player?.category ? <Badge variant="outline" style={{ borderColor: p.player.category_color, color: p.player.category_color }}>{p.player.category}</Badge> : '—'}</TableCell>
                <TableCell>{p.concept || 'Mensualidad'}</TableCell>
                <TableCell className="text-sm">{MONTHS_ES[p.month - 1]} {p.year}</TableCell>
                <TableCell className="font-semibold">
                  {p.status === 'partial' ? `${fmt(p.amount)} de ${fmt(getPaymentExpected(p))}` : fmt(getPaymentExpected(p))}
                </TableCell>
                <TableCell>
                  {p.status === 'paid' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1" />Pagado</Badge>}
                  {p.status === 'partial' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" />Parcial</Badge>}
                  {p.status === 'pending' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.payment_method ? `${p.payment_method} / ${p.account || '—'}` : '—'}</TableCell>
                <TableCell className="text-right">
                  {p.status !== 'paid' ? (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => markPaid(p)}>Marcar pagado</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => markPending(p)}>Desmarcar</Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && !loading && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No hay movimientos para este filtro.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function ReportsView() {
  const [data, setData] = useState(null);
  useEffect(() => { (async () => { try { setData(await api('reports/summary')); } catch (e) { toast.error(e.message); } })(); }, []);
  if (!data) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;

  const pieData = data.byCategory.map((c) => ({ name: c.name, value: c.collected }));
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reportes</h2>
        <p className="text-muted-foreground text-sm">Análisis financiero general</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total cobrado" value={fmt(data.totalPaid)} color="emerald" />
        <StatCard icon={AlertTriangle} label="Total pendiente" value={fmt(data.totalPending)} color="amber" />
        <StatCard icon={CreditCard} label="Total pagos" value={data.totalPayments} color="blue" />
        <StatCard icon={Users} label="Total jugadores" value={data.totalPlayers} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Recaudado por categoría</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Detalle por categoría</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Categoría</TableHead><TableHead>Cobrado</TableHead><TableHead>Pendiente</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {data.byCategory.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-emerald-600 font-semibold">{fmt(c.collected)}</TableCell>
                    <TableCell className="text-amber-600 font-semibold">{fmt(c.pending)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function App() {
  const [authed, setAuthed] = useState(null);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    api('auth/me').then(() => setAuthed(true)).catch(() => setAuthed(false));
  }, []);

  const logout = async () => {
    try { await api('auth/logout', { method: 'POST' }); } catch {}
    setAuthed(false);
  };

  if (authed === null) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar view={view} setView={setView} onLogout={logout} />
      <main className="flex-1 overflow-x-auto">
        {view === 'dashboard' && <Dashboard />}
        {view === 'players' && <PlayersView />}
        {view === 'payments' && <PaymentsView />}
        {view === 'categories' && <CategoriesView />}
        {view === 'reports' && <ReportsView />}
      </main>
    </div>
  );
}

export default App;

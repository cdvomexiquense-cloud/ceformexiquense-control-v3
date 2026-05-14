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
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: String(month), year: String(year) });
      if (status !== 'all') params.set('status', status);
      const data = await api(`payments?${params.toString()}`);
      setPayments(data);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [month, year, status]);

  const generate = async () => {
    try {
      const r = await api('payments/generate', { method: 'POST', body: JSON.stringify({ month, year }) });
      toast.success(`Generados ${r.created} pagos pendientes (${r.skipped} ya existían)`);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const togglePaid = async (p) => {
    try {
      const newStatus = p.status === 'paid' ? 'pending' : 'paid';
      await api(`payments/${p.id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus, payment_method: newStatus === 'paid' ? 'efectivo' : '' }) });
      toast.success(newStatus === 'paid' ? 'Marcado como pagado' : 'Marcado como pendiente');
      load();
    } catch (e) { toast.error(e.message); }
  };
  const remove = async (id) => {
    if (!confirm('¿Eliminar este pago?')) return;
    try { await api(`payments/${id}`, { method: 'DELETE' }); toast.success('Eliminado'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const totals = useMemo(() => {
    const collected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
    const pending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
    return { collected, pending, total: collected + pending };
  }, [payments]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Pagos</h2>
          <p className="text-muted-foreground text-sm">Control de cobros mensuales</p>
        </div>
        <Button onClick={generate} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Generar mensualidad</Button>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Mes</Label>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{MONTHS_ES.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Año</Label>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{[2024, 2025, 2026].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Estado</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paid">Pagados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              <TableHead>Periodo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pagado el</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.player?.name || '—'}</TableCell>
                <TableCell>
                  {p.player?.category ? <Badge variant="outline" style={{ borderColor: p.player.category_color, color: p.player.category_color }}>{p.player.category}</Badge> : '—'}
                </TableCell>
                <TableCell className="text-sm">{MONTHS_ES[p.month - 1]} {p.year}</TableCell>
                <TableCell className="font-semibold">{fmt(p.amount)}</TableCell>
                <TableCell>
                  {p.status === 'paid' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1" />Pagado</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.paid_date ? new Date(p.paid_date).toLocaleDateString('es-MX') : '—'}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant={p.status === 'paid' ? 'outline' : 'default'} className={p.status === 'paid' ? '' : 'bg-emerald-600 hover:bg-emerald-700'} onClick={() => togglePaid(p)}>
                    {p.status === 'paid' ? 'Desmarcar' : 'Marcar pagado'}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && !loading && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                No hay pagos. Usa "Generar mensualidad" para crear los pagos del mes.
              </TableCell></TableRow>
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

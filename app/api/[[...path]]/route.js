import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/mongo';
import { signToken, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function json(data, init = {}) {
  return NextResponse.json(data, init);
}
function err(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function handle(request, { params }) {
  const path = (params?.path || []).join('/');
  const method = request.method;
  const url = new URL(request.url);
  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  // ---------------- AUTH ----------------
  if (path === 'auth/login' && method === 'POST') {
    const { username, password } = body || {};
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    let authUser = null;
    if (username === adminUser && password === adminPass) {
      authUser = { username, role: 'owner' };
    } else {
      try {
        const dbLogin = await getDb();
        const stored = await dbLogin.collection('users').findOne({ email: username, password });
        if (stored) authUser = { username: stored.email, role: stored.role || 'admin', name: stored.name };
      } catch {}
    }
    if (authUser) {
      const token = signToken({ sub: authUser.username, role: authUser.role, name: authUser.name || authUser.username });
      const res = json({ ok: true, user: authUser });
      res.headers.set(
        'Set-Cookie',
        `auth_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
      );
      return res;
    }
    return err('Usuario o contraseña incorrectos', 401);
  }

  if (path === 'auth/logout' && method === 'POST') {
    const res = json({ ok: true });
    res.headers.set('Set-Cookie', 'auth_token=; Path=/; HttpOnly; Max-Age=0');
    return res;
  }

  if (path === 'auth/me' && method === 'GET') {
    const user = requireAuth(request);
    if (!user) return err('No autenticado', 401);
    return json({ user });
  }

  // Auth required for everything below
  const user = requireAuth(request);
  if (!user) return err('No autenticado', 401);

  const db = await getDb();

  // ---------------- CATEGORIES ----------------
  if (path === 'categories' && method === 'GET') {
    const items = await db.collection('categories').find({}).sort({ name: 1 }).toArray();
    return json(items.map((c) => ({ ...c, _id: undefined })));
  }
  if (path === 'categories' && method === 'POST') {
    const { name, monthly_fee, color } = body || {};
    if (!name) return err('Nombre requerido');
    const doc = {
      id: uuidv4(),
      name,
      monthly_fee: Number(monthly_fee) || 0,
      color: color || '#22c55e',
      created_at: new Date().toISOString(),
    };
    await db.collection('categories').insertOne(doc);
    return json({ ...doc, _id: undefined });
  }
  if (path.startsWith('categories/') && (method === 'PUT' || method === 'DELETE')) {
    const id = path.split('/')[1];
    if (method === 'DELETE') {
      await db.collection('categories').deleteOne({ id });
      return json({ ok: true });
    }
    const update = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.monthly_fee !== undefined) update.monthly_fee = Number(body.monthly_fee);
    if (body.color !== undefined) update.color = body.color;
    await db.collection('categories').updateOne({ id }, { $set: update });
    const doc = await db.collection('categories').findOne({ id });
    return json({ ...doc, _id: undefined });
  }

  // ---------------- PLAYERS ----------------
  if (path === 'players' && method === 'GET') {
    const items = await db.collection('players').find({}).sort({ name: 1 }).toArray();
    const categories = await db.collection('categories').find({}).toArray();
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
    return json(
      items.map((p) => ({
        ...p,
        _id: undefined,
        category: catMap[p.category_id] ? { id: catMap[p.category_id].id, name: catMap[p.category_id].name, color: catMap[p.category_id].color, monthly_fee: catMap[p.category_id].monthly_fee } : null,
      }))
    );
  }
  if (path === 'players' && method === 'POST') {
    const { name, category_id, phone, parent_name, birthdate, monthly_fee_override, photo_url, active } = body || {};
    if (!name) return err('Nombre requerido');
    const doc = {
      id: uuidv4(),
      name,
      category_id: category_id || null,
      phone: phone || '',
      parent_name: parent_name || '',
      birthdate: birthdate || '',
      monthly_fee_override: monthly_fee_override !== undefined && monthly_fee_override !== '' ? Number(monthly_fee_override) : null,
      photo_url: photo_url || '',
      active: active !== false,
      created_at: new Date().toISOString(),
    };
    await db.collection('players').insertOne(doc);
    return json({ ...doc, _id: undefined });
  }
  if (path.startsWith('players/') && (method === 'PUT' || method === 'DELETE')) {
    const id = path.split('/')[1];
    if (method === 'DELETE') {
      await db.collection('players').deleteOne({ id });
      await db.collection('payments').deleteMany({ player_id: id });
      return json({ ok: true });
    }
    const update = {};
    for (const k of ['name', 'category_id', 'phone', 'parent_name', 'birthdate', 'photo_url', 'active']) {
      if (body[k] !== undefined) update[k] = body[k];
    }
    if (body.monthly_fee_override !== undefined) {
      update.monthly_fee_override = body.monthly_fee_override === '' || body.monthly_fee_override === null ? null : Number(body.monthly_fee_override);
    }
    await db.collection('players').updateOne({ id }, { $set: update });
    const doc = await db.collection('players').findOne({ id });
    return json({ ...doc, _id: undefined });
  }

  // ---------------- PAYMENTS ----------------
  if (path === 'payments' && method === 'GET') {
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    const playerId = url.searchParams.get('player_id');
    const status = url.searchParams.get('status');
    const q = {};
    if (month) q.month = Number(month);
    if (year) q.year = Number(year);
    if (playerId) q.player_id = playerId;
    if (status) q.status = status;
    const items = await db.collection('payments').find(q).sort({ year: -1, month: -1 }).toArray();
    const players = await db.collection('players').find({}).toArray();
    const playerMap = Object.fromEntries(players.map((p) => [p.id, p]));
    const categories = await db.collection('categories').find({}).toArray();
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
    return json(
      items.map((p) => ({
        ...p,
        _id: undefined,
        player: playerMap[p.player_id]
          ? {
              id: playerMap[p.player_id].id,
              name: playerMap[p.player_id].name,
              category: catMap[playerMap[p.player_id].category_id]?.name || null,
              category_color: catMap[playerMap[p.player_id].category_id]?.color || null,
            }
          : null,
      }))
    );
  }
  if (path === 'payments' && method === 'POST') {
    const { player_id, month, year, amount, expected_amount, status, payment_method, account, concept, notes } = body || {};
    if (!player_id || !month || !year) return err('Datos incompletos');
    const doc = {
      id: uuidv4(),
      player_id,
      concept: concept || 'Mensualidad',
      month: Number(month),
      year: Number(year),
      amount: Number(amount) || 0,
      expected_amount: expected_amount !== undefined ? Number(expected_amount) || 0 : Number(amount) || 0,
      status: status || 'pending',
      payment_method: payment_method || '',
      account: account || '',
      notes: notes || '',
      paid_date: status === 'paid' || status === 'partial' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    };
    await db.collection('payments').insertOne(doc);
    return json({ ...doc, _id: undefined });
  }
  if (path.startsWith('payments/') && (method === 'PUT' || method === 'DELETE')) {
    const id = path.split('/')[1];
    if (method === 'DELETE') {
      await db.collection('payments').deleteOne({ id });
      return json({ ok: true });
    }
    const update = {};
    for (const k of ['amount', 'expected_amount', 'status', 'payment_method', 'account', 'concept', 'notes', 'month', 'year']) {
      if (body[k] !== undefined) update[k] = ['amount', 'expected_amount', 'month', 'year'].includes(k) ? Number(body[k]) : body[k];
    }
    if (body.status === 'paid' || body.status === 'partial') update.paid_date = new Date().toISOString();
    if (body.status === 'pending') update.paid_date = null;
    await db.collection('payments').updateOne({ id }, { $set: update });
    const doc = await db.collection('payments').findOne({ id });
    return json({ ...doc, _id: undefined });
  }

  // Generate monthly fees for all active players
  if (path === 'payments/generate' && method === 'POST') {
    const { month, year } = body || {};
    if (!month || !year) return err('month y year requeridos');
    const players = await db.collection('players').find({ active: { $ne: false } }).toArray();
    const categories = await db.collection('categories').find({}).toArray();
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
    let created = 0;
    let skipped = 0;
    for (const p of players) {
      const exists = await db
        .collection('payments')
        .findOne({ player_id: p.id, month: Number(month), year: Number(year), concept: 'Mensualidad' });
      if (exists) {
        skipped++;
        continue;
      }
      const fee =
        p.monthly_fee_override != null ? p.monthly_fee_override : catMap[p.category_id]?.monthly_fee || 0;
      await db.collection('payments').insertOne({
        id: uuidv4(),
        player_id: p.id,
        month: Number(month),
        year: Number(year),
        concept: 'Mensualidad',
        amount: fee,
        expected_amount: fee,
        status: 'pending',
        payment_method: '',
        account: '',
        notes: '',
        paid_date: null,
        created_at: new Date().toISOString(),
      });
      created++;
    }
    return json({ created, skipped });
  }


  // ---------------- EXPENSES ----------------
  if (path === 'expenses' && method === 'GET') {
    const items = await db.collection('expenses').find({}).sort({ date: -1, created_at: -1 }).toArray();
    return json(items.map((x) => ({ ...x, _id: undefined })));
  }
  if (path === 'expenses' && method === 'POST') {
    const doc = {
      id: uuidv4(),
      date: body.date || new Date().toISOString().slice(0, 10),
      concept: body.concept || 'Otro',
      amount: Number(body.amount) || 0,
      account: body.account || '',
      responsible: body.responsible || '',
      notes: body.notes || '',
      created_at: new Date().toISOString(),
    };
    await db.collection('expenses').insertOne(doc);
    return json({ ...doc, _id: undefined });
  }
  if (path.startsWith('expenses/') && method === 'DELETE') {
    await db.collection('expenses').deleteOne({ id: path.split('/')[1] });
    return json({ ok: true });
  }

  // ---------------- MATCHES ----------------
  if (path === 'matches' && method === 'GET') {
    const items = await db.collection('matches').find({}).sort({ date: -1 }).toArray();
    return json(items.map((x) => ({ ...x, _id: undefined })));
  }
  if (path === 'matches' && method === 'POST') {
    const doc = {
      id: uuidv4(),
      date: body.date || new Date().toISOString().slice(0, 10),
      rival: body.rival || '',
      category: body.category || '',
      home_away: body.home_away || 'Local',
      referee: Number(body.referee) || 0,
      transport: Number(body.transport) || 0,
      notes: body.notes || '',
      created_at: new Date().toISOString(),
    };
    await db.collection('matches').insertOne(doc);
    return json({ ...doc, _id: undefined });
  }
  if (path.startsWith('matches/') && method === 'DELETE') {
    await db.collection('matches').deleteOne({ id: path.split('/')[1] });
    return json({ ok: true });
  }

  // ---------------- USERS ----------------
  if (path === 'users' && method === 'GET') {
    const items = await db.collection('users').find({}).sort({ name: 1 }).toArray();
    const envUser = { id: 'owner-env', name: 'Administrador principal', email: process.env.ADMIN_USERNAME || 'admin', role: 'owner' };
    return json([envUser, ...items.map((x) => ({ ...x, password: undefined, _id: undefined }))]);
  }
  if (path === 'users' && method === 'POST') {
    const count = await db.collection('users').countDocuments({});
    if (count >= 4) return err('Límite de 5 usuarios alcanzado. Elimina uno para agregar otro.', 400);
    const doc = { id: uuidv4(), name: body.name || '', email: body.email || '', password: body.password || '', role: body.role || 'admin', created_at: new Date().toISOString() };
    await db.collection('users').insertOne(doc);
    return json({ ...doc, password: undefined, _id: undefined });
  }
  if (path.startsWith('users/') && method === 'DELETE') {
    const id = path.split('/')[1];
    if (id === 'owner-env') return err('No puedes eliminar el usuario principal de variables de entorno', 400);
    await db.collection('users').deleteOne({ id });
    return json({ ok: true });
  }

  // ---------------- STATS / DASHBOARD ----------------
  if (path === 'stats' && method === 'GET') {
    const now = new Date();
    const currentMonth = Number(url.searchParams.get('month') || now.getMonth() + 1);
    const currentYear = Number(url.searchParams.get('year') || now.getFullYear());

    const players = await db.collection('players').find({}).toArray();
    const activePlayers = players.filter((p) => p.active !== false).length;
    const payments = await db.collection('payments').find({}).toArray();
    const expenses = await db.collection('expenses').find({}).toArray();
    const monthPayments = payments.filter((p) => p.month === currentMonth && p.year === currentYear);
    const totalCollected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
    const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
    const monthCollected = monthPayments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
    const monthPending = monthPayments.filter((p) => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
    const monthExpected = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);

    // Last 6 months chart
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const mp = payments.filter((p) => p.month === m && p.year === y);
      months.push({
        label: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        collected: mp.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0),
        pending: mp.filter((p) => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0),
      });
    }

    // Debtors
    const playerMap = Object.fromEntries(players.map((p) => [p.id, p]));
    const debtMap = {};
    payments
      .filter((p) => p.status === 'pending')
      .forEach((p) => {
        if (!debtMap[p.player_id]) debtMap[p.player_id] = { player: playerMap[p.player_id], total: 0, count: 0 };
        debtMap[p.player_id].total += p.amount || 0;
        debtMap[p.player_id].count += 1;
      });
    const topDebtors = Object.values(debtMap)
      .filter((d) => d.player)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((d) => ({ player_id: d.player.id, name: d.player.name, total: d.total, count: d.count }));

    return json({
      activePlayers,
      totalPlayers: players.length,
      totalCollected,
      totalPending,
      totalExpenses: expenses.reduce((s, e) => s + (e.amount || 0), 0),
      monthCollected,
      monthPending,
      monthExpected,
      currentMonth,
      currentYear,
      chart: months,
      topDebtors,
    });
  }

  // ---------------- REPORTS ----------------
  if (path === 'reports/summary' && method === 'GET') {
    const payments = await db.collection('payments').find({}).toArray();
    const expenses = await db.collection('expenses').find({}).toArray();
    const players = await db.collection('players').find({}).toArray();
    const categories = await db.collection('categories').find({}).toArray();
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
    const playerMap = Object.fromEntries(players.map((p) => [p.id, p]));

    const byCategory = {};
    payments.forEach((p) => {
      const pl = playerMap[p.player_id];
      const catId = pl?.category_id || 'none';
      const catName = catMap[catId]?.name || 'Sin categoría';
      if (!byCategory[catId]) byCategory[catId] = { name: catName, collected: 0, pending: 0 };
      if (p.status === 'paid') byCategory[catId].collected += p.amount || 0;
      else byCategory[catId].pending += p.amount || 0;
    });

    const byAccountMap = {};
    payments.filter((p) => p.status === 'paid').forEach((p) => {
      const a = p.account || 'Sin cuenta';
      if (!byAccountMap[a]) byAccountMap[a] = { account: a, income: 0, expense: 0 };
      byAccountMap[a].income += p.amount || 0;
    });
    expenses.forEach((e) => {
      const a = e.account || 'Sin cuenta';
      if (!byAccountMap[a]) byAccountMap[a] = { account: a, income: 0, expense: 0 };
      byAccountMap[a].expense += e.amount || 0;
    });
    const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
    const totalPending = payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + Math.max(0, (p.expected_amount ?? p.amount ?? 0) - (p.status === 'partial' ? (p.amount || 0) : 0)), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    return json({
      byCategory: Object.values(byCategory),
      byAccount: Object.values(byAccountMap),
      totalPaid,
      totalPending,
      totalExpenses,
      net: totalPaid - totalExpenses,
      totalPayments: payments.length,
      totalPlayers: players.length,
    });
  }

  return err('Ruta no encontrada: ' + path, 404);
}

export async function GET(request, ctx) {
  return handle(request, ctx);
}
export async function POST(request, ctx) {
  return handle(request, ctx);
}
export async function PUT(request, ctx) {
  return handle(request, ctx);
}
export async function DELETE(request, ctx) {
  return handle(request, ctx);
}
export async function PATCH(request, ctx) {
  return handle(request, ctx);
}

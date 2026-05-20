
'use client';

import { useEffect, useMemo, useState } from 'react';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

async function api(path, options = {}) {
  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include'
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Error');
  }

  return data;
}

export default function PagosPage() {
  const now = new Date();

  const [players, setPlayers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    player_id: '',
    concept: 'Mensualidad',
    amount: 500,
    payment_method: 'Efectivo',
    notes: '',
  });

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  async function loadData() {
    try {
      setLoading(true);

      const [playersData, paymentsData] = await Promise.all([
        api('players'),
        api(`payments?month=${month}&year=${year}`)
      ]);

      setPlayers(playersData || []);
      setPayments(paymentsData || []);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [month, year]);

  const totals = useMemo(() => {
    const paid = payments
      .filter((p) => p.status === 'paid')
      .reduce((s, p) => s + (p.amount || 0), 0);

    const pending = payments
      .filter((p) => p.status === 'pending')
      .reduce((s, p) => s + (p.amount || 0), 0);

    return {
      paid,
      pending,
      expected: paid + pending,
    };
  }, [payments]);

  async function savePayment() {
    try {
      if (!form.player_id) {
        alert('Selecciona jugador');
        return;
      }

      await api('payments', {
        method: 'POST',
        body: JSON.stringify({
          player_id: form.player_id,
          month,
          year,
          amount: Number(form.amount),
          status: 'paid',
          payment_method: form.payment_method,
          notes: `${form.concept}${form.notes ? ' - ' + form.notes : ''}`,
        })
      });

      setForm({
        player_id: '',
        concept: 'Mensualidad',
        amount: 500,
        payment_method: 'Efectivo',
        notes: '',
      });

      await loadData();

      alert('Pago guardado');
    } catch (e) {
      alert(e.message);
    }
  }

  async function generateMensualidad() {
    try {
      await api('payments/generate', {
        method: 'POST',
        body: JSON.stringify({
          month,
          year,
        })
      });

      await loadData();

      alert('Mensualidades generadas');
    } catch (e) {
      alert(e.message);
    }
  }

  async function markPaid(id) {
    try {
      await api(`payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'paid'
        })
      });

      await loadData();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pagos</h1>
          <p className="text-gray-500">
            Control de mensualidades, arbitraje, transporte y otros conceptos
          </p>
        </div>

        <button
          onClick={generateMensualidad}
          className="bg-green-600 text-white px-5 py-3 rounded-xl font-medium"
        >
          Generar mensualidad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-gray-500 text-sm">Cobrado</p>
          <h2 className="text-3xl font-bold text-green-600">
            ${totals.paid}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-gray-500 text-sm">Pendiente</p>
          <h2 className="text-3xl font-bold text-orange-500">
            ${totals.pending}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-gray-500 text-sm">Esperado</p>
          <h2 className="text-3xl font-bold">
            ${totals.expected}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-gray-500 text-sm">Pagos registrados</p>
          <h2 className="text-3xl font-bold">
            {payments.length}
          </h2>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">

        <h2 className="text-xl font-bold mb-5">
          Registrar pago
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block mb-2 font-medium">
              Jugador
            </label>

            <select
              value={form.player_id}
              onChange={(e) => setForm({ ...form, player_id: e.target.value })}
              className="w-full border rounded-xl p-3"
            >
              <option value="">
                Seleccionar jugador
              </option>

              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Concepto
            </label>

            <select
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
              className="w-full border rounded-xl p-3"
            >
              <option>Mensualidad</option>
              <option>Arbitraje</option>
              <option>Transporte</option>
              <option>Uniforme</option>
              <option>Torneo</option>
              <option>Otro</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Monto
            </label>

            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Método de pago
            </label>

            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full border rounded-xl p-3"
            >
              <option>Efectivo</option>
              <option>Transferencia</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Mes
            </label>

            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full border rounded-xl p-3"
            >
              {MONTHS.map((m, index) => (
                <option key={m} value={index + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Año
            </label>

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full border rounded-xl p-3"
            />
          </div>

        </div>

        <div className="mt-5">
          <label className="block mb-2 font-medium">
            Notas
          </label>

          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border rounded-xl p-3"
            rows="3"
            placeholder="Notas opcionales"
          />
        </div>

        <button
          onClick={savePayment}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl font-medium"
        >
          Guardar pago
        </button>

      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <div className="p-5 border-b">
          <h2 className="text-xl font-bold">
            Historial de pagos
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            Cargando...
          </div>
        ) : (
          <div className="overflow-auto">

            <table className="w-full">

              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">Jugador</th>
                  <th className="text-left p-4">Categoría</th>
                  <th className="text-left p-4">Concepto</th>
                  <th className="text-left p-4">Monto</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-left p-4">Método</th>
                  <th className="text-left p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>

                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t">

                    <td className="p-4">
                      {payment.player?.name}
                    </td>

                    <td className="p-4">
                      {payment.player?.category || '-'}
                    </td>

                    <td className="p-4">
                      {payment.notes || 'Mensualidad'}
                    </td>

                    <td className="p-4 font-semibold">
                      ${payment.amount}
                    </td>

                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {payment.status === 'paid'
                          ? 'Pagado'
                          : 'Pendiente'}
                      </span>
                    </td>

                    <td className="p-4">
                      {payment.payment_method || '-'}
                    </td>

                    <td className="p-4">

                      {payment.status !== 'paid' && (
                        <button
                          onClick={() => markPaid(payment.id)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          Marcar pagado
                        </button>
                      )}

                    </td>

                  </tr>
                ))}

                {!payments.length && (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-8 text-center text-gray-500"
                    >
                      No hay pagos registrados
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

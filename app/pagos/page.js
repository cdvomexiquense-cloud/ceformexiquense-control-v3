
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

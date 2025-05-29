import { useState, useEffect } from 'react';

export default function SalesTracker() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('salesEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    cash: '',
    eft: '',
    card: '',
    tips: '',
  });

  useEffect(() => {
    localStorage.setItem('salesEntries', JSON.stringify(entries));
  }, [entries]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    const newEntry = {
      ...form,
      cash: parseFloat(form.cash) || 0,
      eft: parseFloat(form.eft) || 0,
      card: parseFloat(form.card) || 0,
      tips: parseFloat(form.tips) || 0,
    };
    setEntries([...entries, newEntry]);
    setForm({ ...form, cash: '', eft: '', card: '', tips: '' });
  };

  const totalForDate = (date) => {
    return entries
      .filter((e) => e.date === date)
      .reduce(
        (acc, cur) => {
          acc.cash += cur.cash;
          acc.eft += cur.eft;
          acc.card += cur.card;
          acc.tips += cur.tips;
          return acc;
        },
        { cash: 0, eft: 0, card: 0, tips: 0 }
      );
  };

  const todayTotals = totalForDate(form.date);

  return (
    <div className="container">
      <h1>Sales Tracker</h1>
      <div className="card">
        <label>Date:
          <input type="date" name="date" value={form.date} onChange={handleChange} />
        </label>
        <label>Cash:
          <input type="number" name="cash" value={form.cash} onChange={handleChange} />
        </label>
        <label>EFT:
          <input type="number" name="eft" value={form.eft} onChange={handleChange} />
        </label>
        <label>Card:
          <input type="number" name="card" value={form.card} onChange={handleChange} />
        </label>
        <label>Tips:
          <input type="number" name="tips" value={form.tips} onChange={handleChange} />
        </label>
        <button onClick={handleSubmit}>Save Entry</button>
      </div>

      <div className="totals">
        <h2>Today's Totals</h2>
        <p>Cash: R{todayTotals.cash.toFixed(2)}</p>
        <p>EFT: R{todayTotals.eft.toFixed(2)}</p>
        <p>Card: R{todayTotals.card.toFixed(2)}</p>
        <p>Tips: R{todayTotals.tips.toFixed(2)}</p>
        <p><strong>Total: R{(
          todayTotals.cash + todayTotals.eft + todayTotals.card + todayTotals.tips
        ).toFixed(2)}</strong></p>
      </div>
    </div>
  );
}
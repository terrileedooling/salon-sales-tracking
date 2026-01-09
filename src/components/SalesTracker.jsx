import { useState, useEffect } from 'react';

export default function SalesTracker() {
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    amount: '',
    tip: '',
  };

  const [form, setForm] = useState(initialFormState);
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('salesTransactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastCleared, setLastCleared] = useState(null);

  useEffect(() => {
    localStorage.setItem('salesTransactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const amount = parseFloat(form.amount);
    const tip = parseFloat(form.tip);

    if (isNaN(amount) || amount < 0 || isNaN(tip) || tip < 0) {
      alert('Please enter valid non-negative numbers for amount and tip.');
      return;
    }

    const newTransaction = {
      date: form.date,
      method: form.method,
      amount,
      tip,
    };

    setTransactions(prev => [...prev, newTransaction]);
    setForm(prev => ({ ...prev, amount: '', tip: '' }));
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all transactions?')) {
      setLastCleared(transactions);
      setTransactions([]);
      setForm(initialFormState);
      localStorage.removeItem('salesTransactions');
    }
  };

  const handleUndo = () => {
    if (lastCleared) {
      setTransactions(lastCleared);
      localStorage.setItem('salesTransactions', JSON.stringify(lastCleared));
      setLastCleared(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Method', 'Amount', 'Tip'];
    const rows = transactions.map(t =>
      [t.date, t.method, t.amount.toFixed(2), t.tip.toFixed(2)]
    );

    const csvContent = [headers, ...rows]
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sales_transactions.csv');
    link.click();
  };

  const totals = transactions
    .filter(t => t.date === form.date)
    .reduce((acc, cur) => {
      if (!acc[cur.method]) acc[cur.method] = { amount: 0, tip: 0 };
      acc[cur.method].amount += cur.amount;
      acc[cur.method].tip += cur.tip;
      return acc;
    }, { cash: { amount: 0, tip: 0 }, eft: { amount: 0, tip: 0 }, card: { amount: 0, tip: 0 } });

  const grandTotal = Object.values(totals).reduce((sum, val) => sum + val.amount + val.tip, 0);

  return (
    <div style={{
      maxWidth: '100%',
      padding: '20px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box'
    }}>
      <h1>Sales Tracker</h1>

      <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label>
            Date:
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </label>

          <label>
            Method:
            <select name="method" value={form.method} onChange={handleChange}>
              <option value="cash">Cash</option>
              <option value="eft">EFT</option>
              <option value="card">Card</option>
            </select>
          </label>

          <label>
            Amount:
            <input
              type="number"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
            />
          </label>

          <label>
            Tip:
            <input
              type="number"
              step="0.01"
              name="tip"
              value={form.tip}
              onChange={handleChange}
            />
          </label>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={handleSubmit}>Add Transaction</button>
          <button onClick={handleClear}>Clear</button>
          {lastCleared && (
            <button onClick={handleUndo} style={{ color: 'red' }}>Undo</button>
          )}
          <button onClick={exportCSV}>Export to CSV</button>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>Totals for {form.date}</h2>
        {['cash', 'eft', 'card'].map(method => (
          <div key={method}>
            <strong>{method.toUpperCase()}</strong>: Amount: R{totals[method].amount.toFixed(2)}, Tips: R{totals[method].tip.toFixed(2)}
          </div>
        ))}
        <h3>Grand Total: R{grandTotal.toFixed(2)}</h3>
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>Transactions for {form.date}</h2>
        {transactions.filter(t => t.date === form.date).length === 0 && <p>No transactions yet.</p>}
        <ul style={{ paddingLeft: 20 }}>
          {transactions.filter(t => t.date === form.date).map((t, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {t.method.toUpperCase()}: Amount R{t.amount.toFixed(2)}, Tip R{t.tip.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
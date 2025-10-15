import { useEffect, useState } from 'react';
import axios from 'axios';

const transactionDefaults = {
  productId: '',
  type: 'OUT',
  quantity: 1,
  note: '',
};

function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formValues, setFormValues] = useState(transactionDefaults);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDownload = (type) => {
    window.open(`/api/export/${type}`, '_blank', 'noopener');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/transactions', {
        productId: Number(formValues.productId),
        type: formValues.type,
        quantity: Number(formValues.quantity),
        note: formValues.note,
      });
      setSuccess('Transaction recorded.');
      setFormValues(transactionDefaults);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Generate Reports</h2>
        <p className="mt-2 text-sm text-slate-500">
          Export current inventory snapshot as Excel or PDF for offline sharing.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => handleDownload('excel')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
          >
            Download Excel
          </button>
          <button
            type="button"
            onClick={() => handleDownload('pdf')}
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
          >
            Download PDF
          </button>
        </div>
      </section>
      <section className="rounded-lg bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-700">Record Transaction</h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-4">
            <label className="flex flex-col text-sm text-slate-600">
              Product ID
              <input
                name="productId"
                type="number"
                min="1"
                required
                value={formValues.productId}
                onChange={handleChange}
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-600">
              Type
              <select
                name="type"
                value={formValues.type}
                onChange={handleChange}
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
              >
                <option value="IN">Receive (IN)</option>
                <option value="OUT">Issue (OUT)</option>
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-600">
              Quantity
              <input
                name="quantity"
                type="number"
                min="1"
                required
                value={formValues.quantity}
                onChange={handleChange}
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-600 sm:col-span-4">
              Note
              <input
                name="note"
                value={formValues.note}
                onChange={handleChange}
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
                placeholder="Optional remarks"
              />
            </label>
            <div className="sm:col-span-4">
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700">Recent Transactions</h2>
          <button
            type="button"
            onClick={fetchTransactions}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Loading transactions…</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Product ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.length === 0 && (
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-500" colSpan={5}>
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{tx.product_id}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          tx.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{tx.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{tx.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Reports;

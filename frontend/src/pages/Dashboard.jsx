import { useEffect, useState } from 'react';
import axios from 'axios';

const initialState = {
  totalProducts: 0,
  lowStockItems: 0,
  recentProducts: [],
};

function Dashboard() {
  const [summary, setSummary] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get('/api/products/summary');
        setSummary(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-slate-700">Overview</h2>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Products</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">{summary.totalProducts}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Low Stock Items</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{summary.lowStockItems}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-2 text-2xl font-bold text-primary">{isLoading ? 'Loading…' : 'Updated'}</p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-700">Recent Products</h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Quantity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Added On
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summary.recentProducts.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-slate-500" colSpan={3}>
                    No products recorded yet.
                  </td>
                </tr>
              )}
              {summary.recentProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 text-sm text-slate-700">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {product.quantity} {product.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(product.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;


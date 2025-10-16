import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiBox, FiRefreshCw } from 'react-icons/fi';
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
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-wide text-base-content">Overview</h2>
            <p className="text-sm text-base-content/70">
              Quick pulse of inventory health for the orange &amp; black crew.
            </p>
          </div>
          {isLoading && (
            <span className="badge badge-lg border-primary bg-primary/10 text-primary">
              <span className="loading loading-spinner loading-xs" />
              Syncing
            </span>
          )}
        </div>
        {error && (
          <div role="alert" className="alert alert-error border border-error/20 bg-error/10 text-error-content">
            <FiAlertTriangle className="text-xl" />
            <span>{error}</span>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card bg-base-100 shadow-xl shadow-primary/10">
            <div className="card-body flex-row items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-base-content/60">
                  Total Products
                </p>
                <p className="mt-2 text-3xl font-extrabold text-base-content">{summary.totalProducts}</p>
              </div>
              <div className="btn btn-circle btn-primary btn-outline border-2 border-primary text-primary">
                <FiBox className="text-xl" />
              </div>
            </div>
          </article>
          <article className="card bg-base-100 shadow-xl shadow-warning/10">
            <div className="card-body flex-row items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-base-content/60">
                  Low Stock Items
                </p>
                <p className="mt-2 text-3xl font-extrabold text-warning">{summary.lowStockItems}</p>
              </div>
              <div className="btn btn-circle border-2 border-warning/60 bg-warning/10 text-warning">
                <FiAlertTriangle className="text-xl" />
              </div>
            </div>
          </article>
          <article className="card bg-base-100 shadow-xl shadow-primary/10">
            <div className="card-body flex-row items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-base-content/60">Status</p>
                <p className="mt-2 text-3xl font-extrabold text-primary">
                  {isLoading ? 'Loading…' : 'Up to date'}
                </p>
              </div>
              <div className="btn btn-circle border-2 border-primary/60 bg-primary/10 text-primary">
                <FiRefreshCw className="text-xl" />
              </div>
            </div>
          </article>
        </div>
      </section>
      <section className="card border border-base-300 bg-base-100 shadow-lg shadow-base-300/40">
        <div className="card-body space-y-4 p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-6 py-4">
            <h2 className="text-xl font-semibold uppercase tracking-wide text-base-content">
              Recent Products
            </h2>
            <div className="badge badge-outline border-primary/40 text-primary">
              Last {summary.recentProducts.length || 0} arrivals
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra table-pin-rows">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-base-content/70">
                  <th className="bg-base-200">Name</th>
                  <th className="bg-base-200">Quantity</th>
                  <th className="bg-base-200">Added On</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentProducts.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-sm text-base-content/60" colSpan={3}>
                      No products recorded yet.
                    </td>
                  </tr>
                )}
                {summary.recentProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="font-medium text-base-content/90">{product.name}</td>
                    <td className="text-base-content/80">
                      {product.quantity} {product.unit}
                    </td>
                    <td className="text-base-content/60">
                      {new Date(product.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

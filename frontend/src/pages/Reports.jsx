import { useEffect, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiRefreshCw,
  FiSend,
  FiTrendingUp,
} from 'react-icons/fi';
import axios from 'axios';

const transactionDefaults = {
  productId: '',
  type: 'OUT',
  quantity: 1,
  note: '',
};

const createTransactionDefaults = () => ({ ...transactionDefaults });

function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formValues, setFormValues] = useState(() => createTransactionDefaults());
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
      setFormValues(createTransactionDefaults());
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // return (
  //   <div className="space-y-8">
  //     <section className="card border border-base-300 bg-base-100 shadow-xl shadow-base-300/40">
  //       <div className="card-body space-y-6">
  //         <div className="flex flex-wrap items-center justify-between gap-3">
  //           <div>
  //             <h2 className="text-2xl font-black uppercase tracking-wide text-base-content">
  //               Generate Reports
  //             </h2>
  //             <p className="text-sm text-base-content/70">
  //               Deliver orange &amp; black ready exports for leadership in a single click.
  //             </p>
  //           </div>
  //           <div className="btn btn-circle btn-ghost text-primary">
  //             <FiFileText className="text-2xl" />
  //           </div>
  //         </div>
  //         <div className="flex flex-wrap gap-3">
  //           <button
  //             type="button"
  //             onClick={() => handleDownload('excel')}
  //             className="btn btn-primary gap-2 uppercase tracking-wide"
  //           >
  //             <FiDownload className="text-base" />
  //             Excel
  //           </button>
  //           <button
  //             type="button"
  //             onClick={() => handleDownload('pdf')}
  //             className="btn btn-secondary gap-2 uppercase tracking-wide"
  //           >
  //             <FiTrendingUp className="text-base" />
  //             PDF
  //           </button>
  //         </div>
  //         <div className="rounded-box border border-base-300 bg-base-200/40 p-4 text-sm text-base-content/70">
  //           Exports include the organization palette so stakeholders instantly recognize VeloceStock
  //           ownership.
  //         </div>
  //       </div>
  //     </section>
  //     <section className="card border border-base-300 bg-base-100 shadow-xl shadow-base-300/40">
  //       <div className="card-body space-y-6">
  //         <div className="flex flex-wrap items-center justify-between gap-4">
  //           <div>
  //             <h2 className="text-2xl font-black uppercase tracking-wide text-base-content">
  //               Record Transaction
  //             </h2>
  //             <p className="text-sm text-base-content/70">
  //               Log stock movements to keep analytics dashboards current.
  //             </p>
  //           </div>
  //           <button
  //             type="button"
  //             onClick={fetchTransactions}
  //             className="btn btn-ghost btn-sm gap-2 text-base-content/80"
  //           >
  //             <FiRefreshCw className="text-base" />
  //             Refresh
  //           </button>
  //         </div>
  //         <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-4">
  //           <label className="form-control w-full">
  //             <span className="label">
  //               <span className="label-text font-semibold uppercase tracking-wide text-base-content">
  //                 Product ID
  //               </span>
  //             </span>
  //             <input
  //               name="productId"
  //               type="number"
  //               min="1"
  //               required
  //               value={formValues.productId}
  //               onChange={handleChange}
  //               className="input input-bordered input-primary w-full bg-base-100"
  //             />
  //           </label>
  //           <label className="form-control w-full">
  //             <span className="label">
  //               <span className="label-text font-semibold uppercase tracking-wide text-base-content">
  //                 Type
  //               </span>
  //             </span>
  //             <select
  //               name="type"
  //               value={formValues.type}
  //               onChange={handleChange}
  //               className="select select-bordered bg-base-100"
  //             >
  //               <option value="IN">Receive (IN)</option>
  //               <option value="OUT">Issue (OUT)</option>
  //             </select>
  //           </label>
  //           <label className="form-control w-full">
  //             <span className="label">
  //               <span className="label-text font-semibold uppercase tracking-wide text-base-content">
  //                 Quantity
  //               </span>
  //             </span>
  //             <input
  //               name="quantity"
  //               type="number"
  //               min="1"
  //               required
  //               value={formValues.quantity}
  //               onChange={handleChange}
  //               className="input input-bordered input-primary w-full bg-base-100"
  //             />
  //           </label>
  //           <label className="form-control w-full lg:col-span-4">
  //             <span className="label">
  //               <span className="label-text font-semibold uppercase tracking-wide text-base-content">
  //                 Note
  //               </span>
  //               <span className="label-text-alt text-base-content/60">Optional</span>
  //             </span>
  //             <textarea
  //               name="note"
  //               value={formValues.note}
  //               onChange={handleChange}
  //               className="textarea textarea-bordered textarea-primary w-full bg-base-100"
  //               placeholder="Add a quick audit trail note"
  //             />
  //           </label>
  //           <div className="lg:col-span-4">
  //             <button
  //               type="submit"
  //               className="btn btn-primary gap-2 uppercase tracking-wide disabled:opacity-60"
  //               disabled={isSubmitting}
  //             >
  //               {isSubmitting ? (
  //                 <>
  //                   <span className="loading loading-spinner loading-xs" />
  //                   Saving…
  //                 </>
  //               ) : (
  //                 <>
  //                   <FiSend className="text-base" />
  //                   Save Transaction
  //                 </>
  //               )}
  //             </button>
  //           </div>
  //         </form>
  //         {error && (
  //           <div
  //             role="alert"
  //             className="alert alert-error border border-error border-opacity-20 bg-error/10 text-error-content"
  //           >
  //             <FiAlertCircle className="text-xl" />
  //             <span>{error}</span>
  //           </div>
  //         )}
  //         {success && (
  //           <div
  //             role="alert"
  //             className="alert alert-success border border-success border-opacity-20 bg-success/10 text-success-content"
  //           >
  //             <FiCheckCircle className="text-xl" />
  //             <span>{success}</span>
  //           </div>
  //         )}
  //         {isLoading ? (
  //           <div className="flex justify-center py-12">
  //             <span className="loading loading-ring loading-lg text-primary" />
  //           </div>
  //         ) : (
  //           <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
  //             <table className="table table-zebra">
  //               <thead>
  //                 <tr className="text-xs uppercase tracking-wide text-base-content/70">
  //                   <th>Date</th>
  //                   <th>Product ID</th>
  //                   <th>Type</th>
  //                   <th>Quantity</th>
  //                   <th>Note</th>
  //                 </tr>
  //               </thead>
  //               <tbody>
  //                 {transactions.length === 0 && (
  //                   <tr>
  //                     <td className="py-6 text-center text-sm text-base-content/60" colSpan={5}>
  //                       No transactions recorded yet.
  //                     </td>
  //                   </tr>
  //                 )}
  //                 {transactions.map((tx) => (
  //                   <tr key={tx.id}>
  //                     <td className="text-base-content/80">
  //                       {new Date(tx.created_at).toLocaleString()}
  //                     </td>
  //                     <td className="font-mono text-sm text-base-content">{tx.product_id}</td>
  //                     <td>
  //                       <span
  //                         className={`badge badge-outline gap-1 ${
  //                           tx.type === 'IN'
  //                             ? 'border-success border-opacity-40 text-success'
  //                             : 'border-error border-opacity-40 text-error'
  //                         }`}
  //                       >
  //                         {tx.type}
  //                       </span>
  //                     </td>
  //                     <td className="text-base-content/80">{tx.quantity}</td>
  //                     <td className="text-base-content/60">{tx.note || '—'}</td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //           </div>
  //         )}
  //       </div>
  //     </section>
  //   </div>
  // );
}

export default Reports;

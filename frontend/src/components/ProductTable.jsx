import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { RiQrScan2Line } from 'react-icons/ri';

function ProductTable({ products, onEdit, onDelete, onViewQr }) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100 shadow-lg shadow-base-300/40">
      <table className="table table-zebra">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-base-content/70">
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Asset Code</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td className="py-6 text-center text-sm text-base-content/60" colSpan={5}>
                No products match your filters.
              </td>
            </tr>
          )}
          {products.map((product) => (
            <tr key={product.id}>
              <td className="font-semibold text-base-content">{product.name}</td>
              <td>
                <span className="badge badge-outline border-secondary border-opacity-30 bg-base-100 text-base-content">
                  {product.category || '—'}
                </span>
              </td>
              <td>
                <span className="badge badge-primary badge-outline gap-1 text-primary">
                  {product.quantity} {product.unit}
                </span>
              </td>
              <td className="font-mono text-sm text-base-content/70">{product.asset_code}</td>
              <td>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-xs gap-1 border-primary border-opacity-60 text-primary"
                    onClick={() => onViewQr(product)}
                    aria-label={`View QR for ${product.name}`}
                  >
                    <RiQrScan2Line className="text-sm" />
                    QR
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs gap-1 text-base-content/80"
                    onClick={() => onEdit(product)}
                    aria-label={`Edit ${product.name}`}
                  >
                    <FiEdit2 className="text-sm" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs gap-1 border-error border-opacity-50 text-error"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.name}`}
                  >
                    <FiTrash2 className="text-sm" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;

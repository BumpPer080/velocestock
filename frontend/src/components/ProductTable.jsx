function ProductTable({ products, onEdit, onDelete, onViewQr }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Category
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Quantity
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Asset Code
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {products.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-500" colSpan={5}>
                No products match your filters.
              </td>
            </tr>
          )}
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3 text-sm text-slate-700">{product.name}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{product.category}</td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {product.quantity} {product.unit}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{product.asset_code}</td>
              <td className="px-4 py-3 text-sm text-slate-500">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    onClick={() => onViewQr(product)}
                  >
                    QR
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-rose-200 px-3 py-1 text-xs text-rose-600 hover:bg-rose-50"
                    onClick={() => onDelete(product)}
                  >
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


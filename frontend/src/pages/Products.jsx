import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ProductForm from '../components/ProductForm.jsx';
import ProductTable from '../components/ProductTable.jsx';

const mapProductToFormValues = (product) => ({
  id: product.id,
  name: product.name ?? '',
  category: product.category ?? '',
  assetCode: product.asset_code ?? '',
  importDate: product.import_date ? product.import_date.slice(0, 10) : '',
  quantity: product.quantity ?? 0,
  unit: product.unit ?? '',
});

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(products.map((item) => item.category).filter(Boolean));
    return Array.from(set);
  }, [products]);

  const fetchProducts = async (params = {}) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/products', { params });
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilter = (event) => {
    event.preventDefault();
    fetchProducts({ search, category });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    fetchProducts();
  };

  const handleUpsertProduct = async (values) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('assetCode', values.assetCode);
      formData.append('importDate', values.importDate);
      formData.append('quantity', values.quantity);
      formData.append('unit', values.unit);
      if (values.image) {
        formData.append('image', values.image);
      }

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Product updated successfully.');
      } else {
        await axios.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Product added successfully.');
      }
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(mapProductToFormValues(product));
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);
    if (!confirmed) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/products/${product.id}`);
      setSuccess('Product deleted.');
      fetchProducts({ search, category });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleViewQr = (product) => {
    window.open(`/api/products/${product.id}/qrcode`, '_blank', 'noopener');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700">
          {editingProduct ? 'Edit Product' : 'Add Product'}
        </h2>
        <ProductForm
          initialValues={editingProduct}
          onSubmit={handleUpsertProduct}
          onCancel={editingProduct ? () => setEditingProduct(null) : undefined}
          isSubmitting={isSubmitting}
        />
      </section>
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-700">Inventory</h2>
          <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              placeholder="Search name or asset code"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Reset
            </button>
          </form>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-4 text-sm text-emerald-600">{success}</p>}
        {isLoading ? (
          <p className="mt-6 text-sm text-slate-500">Loading products…</p>
        ) : (
          <div className="mt-6">
            <ProductTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onViewQr={handleViewQr}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default Products;


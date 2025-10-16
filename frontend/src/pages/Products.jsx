import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiFilter, FiRotateCcw, FiSearch } from 'react-icons/fi';
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
    const bucket = new Set(products.map((item) => item.category).filter(Boolean));
    return Array.from(bucket);
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
    <div className="space-y-8">
      <section className="card border border-base-300 bg-base-100 shadow-xl shadow-base-300/40">
        <div className="card-body space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide text-base-content">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </h2>
              <p className="text-sm text-base-content/70">
                Upload new items and keep your asset codes in sync with ease.
              </p>
            </div>
            {editingProduct && (
              <span className="badge badge-warning badge-outline gap-2 border-warning border-opacity-60 text-warning">
                Editing #{editingProduct.assetCode || editingProduct.id}
              </span>
            )}
          </div>
          <ProductForm
            initialValues={editingProduct}
            onSubmit={handleUpsertProduct}
            onCancel={editingProduct ? () => setEditingProduct(null) : undefined}
            isSubmitting={isSubmitting}
          />
        </div>
      </section>
      <section className="card border border-base-300 bg-base-100 shadow-xl shadow-base-300/40">
        <div className="card-body space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide text-base-content">Inventory</h2>
              <p className="text-sm text-base-content/70">
                Filter by name, asset code, or category to spot stock shifts fast.
              </p>
            </div>
            <span className="badge badge-outline border-primary border-opacity-40 text-primary">
              {products.length} results
            </span>
          </div>
          <form
            onSubmit={handleFilter}
            className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto_auto]"
          >
            <label className="input input-bordered flex items-center gap-2 bg-base-100">
              <FiSearch className="text-primary" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or asset code"
                className="w-full bg-transparent focus:outline-none"
              />
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="select select-bordered bg-base-100"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary gap-2 uppercase tracking-wide">
              <FiFilter className="text-base" />
              Apply
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-ghost gap-2 uppercase tracking-wide text-base-content/80"
            >
              <FiRotateCcw className="text-base" />
              Reset
            </button>
          </form>
          {error && (
            <div
              role="alert"
              className="alert alert-error border border-error border-opacity-20 bg-error/10 text-error-content"
            >
              <FiAlertCircle className="text-xl" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div
              role="alert"
              className="alert alert-success border border-success border-opacity-20 bg-success/10 text-success-content"
            >
              <FiCheckCircle className="text-xl" />
              <span>{success}</span>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-ring loading-lg text-primary" />
            </div>
          ) : (
            <div className="mt-2">
              <ProductTable
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onViewQr={handleViewQr}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Products;

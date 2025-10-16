import { useEffect, useState } from 'react';

const defaultValues = {
  name: '',
  category: '',
  assetCode: '',
  importDate: '',
  quantity: 0,
  unit: '',
};

function ProductForm({ initialValues, onSubmit, onCancel, isSubmitting }) {
  const [values, setValues] = useState(defaultValues);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (initialValues) {
      setValues({ ...defaultValues, ...initialValues });
    } else {
      setValues(defaultValues);
    }
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setImage(event.target.files?.[0] ?? null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...values, image });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col text-sm text-slate-600">
          Name
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Category
          <input
            name="category"
            value={values.category}
            onChange={handleChange}
            required
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Asset Code
          <input
            name="assetCode"
            value={values.assetCode}
            onChange={handleChange}
            required
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Import Date
          <input
            type="date"
            name="importDate"
            value={values.importDate}
            onChange={handleChange}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Quantity
          <input
            type="number"
            name="quantity"
            value={values.quantity}
            onChange={handleChange}
            min="0"
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Unit
          <input
            name="unit"
            value={values.unit}
            onChange={handleChange}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
      </div>
      <label className="flex flex-col text-sm text-slate-600">
        Image
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 text-sm text-slate-500"
        />
      </label>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;


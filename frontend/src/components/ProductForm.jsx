import { useEffect, useState } from 'react';
import { FiImage, FiSave, FiX } from 'react-icons/fi';

const defaultValues = {
  name: '',
  category: '',
  assetCode: '',
  importDate: '',
  quantity: 0,
  unit: '',
};

const createDefaultValues = () => ({ ...defaultValues });

function ProductForm({ initialValues, onSubmit, onCancel, isSubmitting }) {
  const [values, setValues] = useState(() => createDefaultValues());
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (initialValues) {
      setValues({ ...createDefaultValues(), ...initialValues });
    } else {
      setValues(createDefaultValues());
    }
    setImage(null);
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setImage(event.target.files?.[0] ?? null);
  };

  const resetForm = () => {
    setValues(createDefaultValues());
    setImage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const wasSuccessful = await onSubmit({ ...values, image });
    if (wasSuccessful) {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="form-control w-full">
          <span className="label">
            <span className="label-text font-semibold uppercase tracking-wide text-base-content">
              ชื่อสินค้า
            </span>
          </span>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            className="input input-bordered input-primary w-full bg-base-100"
            placeholder="E.g. Thermal printer"
          />
        </label>
        <label className="form-control w-full">
          <span className="label">
            <span className="label-text font-semibold uppercase tracking-wide text-base-content">
              หมวดหมู่
            </span>
          </span>
          <input
            name="category"
            value={values.category}
            onChange={handleChange}
            required
            className="input input-bordered input-primary w-full bg-base-100"
            placeholder="E.g. Accessories"
          />
        </label>
        <label className="form-control w-full">
          <span className="label">
            <span className="label-text font-semibold uppercase tracking-wide text-base-content">
              หมวดหมู่
            </span>
            <span className="label-text-alt text-base-content/60">Matches QR code</span>
          </span>
          <input
            name="assetCode"
            value={values.assetCode}
            onChange={handleChange}
            required
            className="input input-bordered input-primary w-full bg-base-100"
            placeholder="E.g. VS-AC-004"
          />
        </label>
        <label className="form-control w-full">
          <span className="label">
            <span className="label-text font-semibold uppercase tracking-wide text-base-content">
              วันที่นำเข้า
            </span>
          </span>
          <input
            type="date"
            name="importDate"
            value={values.importDate}
            onChange={handleChange}
            className="input input-bordered input-primary w-full bg-base-100"
          />
        </label>
        <label className="form-control w-full">
          <span className="label">
            <span className="label-text font-semibold uppercase tracking-wide text-base-content">
              จำนวนสินค้า
            </span>
          </span>
          <input
            type="number"
            name="quantity"
            value={values.quantity}
            onChange={handleChange}
            min="0"
            className="input input-bordered input-primary w-full bg-base-100"
          />
        </label>
        <label className="form-control w-full">
          <span className="label">
            <span className="label-text font-semibold uppercase tracking-wide text-base-content">จำนวนนับ</span>
            <span className="label-text-alt text-base-content/60">ชิ้น กล่อง แท่ง.</span>
          </span>
          <input
            name="unit"
            value={values.unit}
            onChange={handleChange}
            className="input input-bordered input-primary w-full bg-base-100"
          />
        </label>
      </div>
      <label className="form-control w-full">
        <span className="label">
          <span className="label-text font-semibold uppercase tracking-wide text-base-content">
            รูปภาพสินค้า
          </span>
          <span className="label-text-alt text-base-content/60">Optional</span>
        </span>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FiImage className="text-2xl text-primary" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered file-input-sm file-input-primary max-w-xs"
          />
        </div>
      </label>
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            className="btn btn-ghost btn-sm gap-2 text-base-content/80"
            onClick={() => {
              resetForm();
              onCancel();
            }}
          >
            <FiX className="text-base" />
            ยกเลิก
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-sm gap-2 uppercase tracking-wide disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              กำลังบันทึก…
            </>
          ) : (
            <>
              <FiSave className="text-base" />
              เพิ่มสินค้าใหม่
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;

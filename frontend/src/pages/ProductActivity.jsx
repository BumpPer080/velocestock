import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiShield,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const ACTION_LABELS = {
  create: 'สร้างสินค้า',
  update: 'แก้ไขสินค้า',
  delete: 'ลบสินค้า',
};

const parseDetails = (details) => {
  if (!details) return null;
  try {
    return JSON.parse(details);
  } catch (error) {
    return details;
  }
};

const describeDetails = (activity) => {
  const parsed = parseDetails(activity.details);
  if (!parsed) return '—';

  if (typeof parsed === 'string') return parsed;

  if (parsed.updatedFields) {
    return Object.entries(parsed.updatedFields)
      .map(([key, value]) => `${key}: ${value ?? '—'}`)
      .join(', ');
  }

  if (parsed.name || parsed.assetCode) {
    return [parsed.name, parsed.assetCode].filter(Boolean).join(' • ');
  }

  return JSON.stringify(parsed);
};

function ProductActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchActivities = useCallback(
    async (options = {}) => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get('/api/products/activity', {
          params: {
            action: options.actionFilter || actionFilter || undefined,
            limit: 100,
          },
        });
        setActivities(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
      } finally {
        setIsLoading(false);
      }
    },
    [actionFilter],
  );

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchActivities();
    }
  }, [fetchActivities, user?.role]);

  const filteredActivities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activities;
    return activities.filter((activity) => {
      const haystacks = [
        activity.productName,
        activity.assetCode,
        activity.userDisplayName,
        activity.userUsername,
        activity.userRole,
        describeDetails(activity),
        ACTION_LABELS[activity.action] || activity.action,
      ];
      return haystacks
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term));
    });
  }, [activities, search]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-box border border-base-300 bg-base-100 p-10 text-center shadow-xl shadow-base-300/40">
        <FiShield className="text-4xl text-warning" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-wide text-base-content">
            ต้องเป็นผู้ดูแลระบบเท่านั้น
          </h2>
          <p className="text-sm text-base-content/70">
            เฉพาะผู้ใช้ Role <span className="font-semibold text-warning">admin</span> เท่านั้นที่สามารถตรวจสอบกิจกรรมสินค้าได้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="card border border-base-300 bg-base-100 shadow-xl shadow-base-300/40">
        <div className="card-body space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide text-base-content">
                ประวัติกิจกรรมสินค้า
              </h2>
              <p className="text-sm text-base-content/70">
                ตรวจสอบว่าใครเป็นคนสร้าง แก้ไข หรือจัดการสินค้าในระบบ
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-2 text-base-content/80"
              onClick={() => fetchActivities({ actionFilter })}
              disabled={isLoading}
            >
              <FiRefreshCw className="text-base" />
              รีเฟรช
            </button>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              fetchActivities({ actionFilter });
            }}
            className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]"
          >
            <label className="input input-bordered flex items-center gap-2 bg-base-100">
              <FiSearch className="text-primary" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาโดยชื่อสินค้า ผู้ใช้งาน หรือรายละเอียด"
                className="w-full bg-transparent focus:outline-none"
              />
            </label>
            <select
              value={actionFilter}
              onChange={(event) => {
                setActionFilter(event.target.value);
                fetchActivities({ actionFilter: event.target.value });
              }}
              className="select select-bordered bg-base-100"
            >
              <option value="">ทุกประเภท</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary gap-2 uppercase tracking-wide">
              <FiFilter className="text-base" />
              ยืนยัน
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-ring loading-lg text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
              <table className="table table-zebra">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-base-content/70">
                    <th>วันที่</th>
                    <th>สินค้า</th>
                    <th>การกระทำ</th>
                    <th>รายละเอียด</th>
                    <th>ผู้จัดการ</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.length === 0 && (
                    <tr>
                      <td className="py-6 text-center text-sm text-base-content/60" colSpan={6}>
                        ไม่มีกิจกรรมที่ตรงกับเงื่อนไข
                      </td>
                    </tr>
                  )}
                  {filteredActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="text-sm text-base-content/70">
                        {new Date(activity.createdAt).toLocaleString()}
                      </td>
                      <td className="max-w-xs space-y-1">
                        <div className="font-semibold text-base-content">
                          {activity.productName || 'สินค้าถูกลบแล้ว'}
                        </div>
                        {activity.assetCode && (
                          <div className="font-mono text-xs text-base-content/60">{activity.assetCode}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-outline border-primary/40 text-primary">
                          {ACTION_LABELS[activity.action] || activity.action}
                        </span>
                      </td>
                      <td className="text-sm text-base-content/80">{describeDetails(activity)}</td>
                      <td className="text-sm text-base-content">
                        {activity.userDisplayName || activity.userUsername || 'ระบบ'}
                      </td>
                      <td className="text-xs uppercase tracking-wide text-base-content/70">
                        {activity.userRole || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductActivity;


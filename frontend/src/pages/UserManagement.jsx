import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiSave,
  FiShield,
  FiTrash2,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const defaultForm = {
  username: '',
  displayName: '',
  role: 'staff',
  password: '',
};

const createDefaultForm = () => ({ ...defaultForm });

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formValues, setFormValues] = useState(createDefaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const isAdmin = user?.role === 'admin';
  const isEditing = Boolean(editingUser);

  const formTitle = isEditing ? `แก้ไขผู้ใช้ (${editingUser.username})` : 'สร้างผู้ใช้ใหม่';

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/users');
      setUsers(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'ไม่สามารถโหลดรายชื่อผู้ใช้ได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const resetForm = () => {
    setFormValues(createDefaultForm());
    setEditingUser(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (selected) => {
    setEditingUser(selected);
    setFormValues({
      username: selected.username,
      displayName: selected.displayName ?? '',
      role: selected.role,
      password: '',
    });
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        username: formValues.username.trim(),
        displayName: formValues.displayName.trim() || null,
        role: formValues.role,
      };
      if (!payload.username) {
        throw new Error('กรุณากรอกชื่อผู้ใช้');
      }
      if (!isEditing && !formValues.password) {
        throw new Error('กรุณากำหนดรหัสผ่านเริ่มต้น');
      }
      if (formValues.password) {
        payload.password = formValues.password;
      }
      if (isEditing) {
        await axios.put(`/api/users/${editingUser.id}`, payload);
        setSuccess(`อัปเดตข้อมูลของ ${payload.username} เรียบร้อย`);
      } else {
        await axios.post('/api/users', payload);
        setSuccess(`สร้างผู้ใช้ ${payload.username} เรียบร้อย`);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      const message =
        err.message === 'กรุณากรอกชื่อผู้ใช้' || err.message === 'กรุณากำหนดรหัสผ่านเริ่มต้น'
          ? err.message
          : err?.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลผู้ใช้ได้';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleDelete = async (target) => {
    if (target.id === user.id) {
      setError('ไม่สามารถลบบัญชีของตัวเองได้');
      return;
    }
    const confirmed = window.confirm(`ต้องการลบผู้ใช้ ${target.username} หรือไม่?`);
    if (!confirmed) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/users/${target.id}`);
      setSuccess(`ลบผู้ใช้ ${target.username} เรียบร้อย`);
      if (editingUser?.id === target.id) {
        resetForm();
      }
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'ไม่สามารถลบผู้ใช้ได้');
    }
  };

  const totalAdmins = useMemo(
    () => users.filter((item) => item.role === 'admin').length,
    [users],
  );
  const totalStaff = useMemo(
    () => users.filter((item) => item.role === 'staff').length,
    [users],
  );

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-box border border-base-300 bg-base-100 p-10 text-center shadow-xl shadow-base-300/40">
        <FiShield className="text-4xl text-warning" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-wide text-base-content">
            ต้องเป็นผู้ดูแลระบบเท่านั้น
          </h2>
          <p className="text-sm text-base-content/70">
            เฉพาะผู้ใช้ Role <span className="font-semibold text-warning">admin</span> เท่านั้นที่สามารถจัดการบัญชีผู้ใช้ได้
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
                {formTitle}
              </h2>
              <p className="text-sm text-base-content/70">
                {isEditing
                  ? 'ปรับปรุงข้อมูล หรือรีเซ็ตรหัสผ่านของผู้ใช้'
                  : 'สร้างบัญชีใหม่ให้พนักงาน พร้อมเลือกสิทธิ์การใช้งาน'}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm gap-2 border-primary border-opacity-60 text-primary"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              {isEditing ? (
                <>
                  <FiUserPlus className="text-base" />
                  สร้างบัญชีใหม่
                </>
              ) : (
                <>
                  <FiUsers className="text-base" />
                  ทั้งหมด {users.length}
                </>
              )}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="form-control w-full">
              <span className="label">
                <span className="label-text font-semibold uppercase tracking-wide text-base-content">
                  ชื่อผู้ใช้ (Username)
                </span>
              </span>
              <input
                name="username"
                value={formValues.username}
                onChange={handleChange}
                required
                className="input input-bordered input-primary w-full bg-base-100"
                placeholder="veloce"
                disabled={isEditing}
              />
            </label>
            <label className="form-control w-full">
              <span className="label">
                <span className="label-text font-semibold uppercase tracking-wide text-base-content">
                  ชื่อที่ใช้แสดง (Optional)
                </span>
              </span>
              <input
                name="displayName"
                value={formValues.displayName}
                onChange={handleChange}
                className="input input-bordered input-primary w-full bg-base-100"
                placeholder="Inventory Team"
              />
            </label>
            <label className="form-control w-full">
              <span className="label">
                <span className="label-text font-semibold uppercase tracking-wide text-base-content">
                  สิทธิ์การใช้งาน
                </span>
              </span>
              <select
                name="role"
                value={formValues.role}
                onChange={handleChange}
                className="select select-bordered bg-base-100"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control w-full">
              <span className="label">
                <span className="label-text font-semibold uppercase tracking-wide text-base-content">
                  รหัสผ่าน {isEditing ? '(เว้นว่างหากไม่เปลี่ยน)' : ''}
                </span>
              </span>
              <input
                name="password"
                value={formValues.password}
                onChange={handleChange}
                type="password"
                className="input input-bordered input-primary w-full bg-base-100"
                placeholder={isEditing ? '********' : 'Initial@123'}
              />
            </label>
            <div className="md:col-span-2 flex justify-end gap-3">
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-2 text-base-content/80"
                  onClick={handleCancel}
                  disabled={isSubmitting}
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
                    {isEditing ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้'}
                  </>
                )}
              </button>
            </div>
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
        </div>
      </section>
      <section className="card border border-base-300 bg-base-100 shadow-xl shadow-base-300/40">
        <div className="card-body space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide text-base-content">
                รายชื่อผู้ใช้ทั้งหมด
              </h2>
              <p className="text-sm text-base-content/70">
                Admin {totalAdmins} บัญชี • Staff {totalStaff} บัญชี
              </p>
            </div>
            <span className="badge badge-outline border-primary border-opacity-40 text-primary">
              ทั้งหมด {users.length} บัญชี
            </span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-ring loading-lg text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
              <table className="table table-zebra">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-base-content/70">
                    <th>ชื่อผู้ใช้</th>
                    <th>ชื่อแสดง</th>
                    <th>Role</th>
                    <th>สร้างเมื่อ</th>
                    <th>ปรับปรุง</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td className="py-6 text-center text-sm text-base-content/60" colSpan={6}>
                        ยังไม่มีผู้ใช้ที่บันทึกในระบบ
                      </td>
                    </tr>
                  )}
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold text-base-content">{item.username}</td>
                      <td className="text-sm text-base-content/70">{item.displayName || '—'}</td>
                      <td>
                        <span
                          className={`badge badge-outline gap-1 ${
                            item.role === 'admin'
                              ? 'border-primary border-opacity-40 text-primary'
                              : 'border-secondary border-opacity-40 text-secondary'
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="text-sm text-base-content/70">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="text-sm text-base-content/60">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-base-content/80"
                            onClick={() => handleEdit(item)}
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs gap-1 border-error border-opacity-50 text-error"
                            onClick={() => handleDelete(item)}
                            disabled={item.id === user.id}
                          >
                            <FiTrash2 className="text-sm" />
                            ลบ
                          </button>
                        </div>
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

export default UserManagement;


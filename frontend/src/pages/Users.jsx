import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, X, Shield, User } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'staff' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data?.data || res.data.data?.items || res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openCreate = () => { setEditItem(null); setForm({ username: '', password: '', full_name: '', role: 'staff' }); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ username: item.username, password: '', full_name: item.full_name, role: item.role });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        const payload = { full_name: form.full_name, role: form.role };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editItem.id}`, payload);
        toast.success('Cập nhật người dùng thành công');
      } else {
        await api.post('/users', form);
        toast.success('Tạo người dùng thành công');
      }
      setShowModal(false);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi lưu người dùng'); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/users/${deleteTarget}`);
      toast.success('Xóa người dùng thành công');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi xóa người dùng'); }
    finally { setDeleteTarget(null); }
  };

  const roleLabel = (r) => {
    if (r === 'admin') return <span className="badge-danger flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>;
    if (r === 'manager') return <span className="badge-warning">Quản lý</span>;
    return <span className="badge-info">Nhân viên</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Người dùng</h2>
          <p className="text-gray-500 mt-1">Quản lý tài khoản & phân quyền</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Thêm người dùng</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Người dùng</th>
                <th className="table-header">Tên đăng nhập</th>
                <th className="table-header">Vai trò</th>
                <th className="table-header text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-sm">{u.username}</td>
                  <td className="table-cell">{roleLabel(u.role)}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(u.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Chưa có người dùng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editItem ? 'Sửa người dùng' : 'Thêm người dùng'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ tên *</label>
                <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tên đăng nhập *</label>
                <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="input-field" disabled={!!editItem} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{editItem ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vai trò *</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input-field">
                  <option value="staff">Nhân viên</option>
                  <option value="manager">Quản lý</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSave} className="btn-primary">{editItem ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Xóa người dùng" message="Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmText="Xóa" danger />
    </div>
  );
}
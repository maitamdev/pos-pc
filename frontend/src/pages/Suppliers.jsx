import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, X, Truck } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Suppliers() {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', email: '', address: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openCreate = () => { setEditItem(null); setForm({ name: '', contact_name: '', phone: '', email: '', address: '' }); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, contact_name: item.contact_name || '', phone: item.phone || '', email: item.email || '', address: item.address || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.put(`/suppliers/${editItem.id}`, form);
        toast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await api.post('/suppliers', form);
        toast.success('Tạo nhà cung cấp thành công');
      }
      setShowModal(false);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi lưu nhà cung cấp'); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/suppliers/${deleteTarget}`);
      toast.success('Xóa nhà cung cấp thành công');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi xóa nhà cung cấp'); }
    finally { setDeleteTarget(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nhà cung cấp</h2>
          <p className="text-gray-500 mt-1">Quản lý nhà cung cấp</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Thêm nhà cung cấp</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Nhà cung cấp</th>
                <th className="table-header">Người liên hệ</th>
                <th className="table-header">Điện thoại</th>
                <th className="table-header">Email</th>
                <th className="table-header">Địa chỉ</th>
                <th className="table-header text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">{s.contact_name || '-'}</td>
                  <td className="table-cell">{s.phone || '-'}</td>
                  <td className="table-cell">{s.email || '-'}</td>
                  <td className="table-cell text-sm text-gray-500 max-w-[200px] truncate">{s.address || '-'}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(s.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Chưa có nhà cung cấp nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editItem ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên nhà cung cấp *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Người liên hệ</label>
                  <input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Điện thoại</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSave} className="btn-primary">{editItem ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Xóa nhà cung cấp" message="Bạn có chắc muốn xóa nhà cung cấp này?" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmText="Xóa" danger />
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, X, Users as UsersIcon, Phone, Gift, History, Star } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Customers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [loyaltyHistory, setLoyaltyHistory] = useState(null);
  const [loyaltyCustomer, setLoyaltyCustomer] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data.data?.data || res.data.data?.items || res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openCreate = () => { setEditItem(null); setForm({ name: '', phone: '', email: '', address: '' }); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, phone: item.phone || '', email: item.email || '', address: item.address || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.put(`/customers/${editItem.id}`, form);
        toast.success('Cập nhật khách hàng thành công');
      } else {
        await api.post('/customers', form);
        toast.success('Tạo khách hàng thành công');
      }
      setShowModal(false);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi lưu khách hàng'); }
  };

  const viewLoyaltyHistory = async (customer) => {
    try {
      const res = await api.get(`/customers/${customer.id}/loyalty-history`);
      setLoyaltyHistory(res.data.data?.data || res.data.data?.items || res.data.data);
      setLoyaltyCustomer(customer);
    } catch (err) { console.error(err); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/customers/${deleteTarget}`);
      toast.success('Xóa khách hàng thành công');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi xóa khách hàng'); }
    finally { setDeleteTarget(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Khách hàng</h2>
          <p className="text-gray-500 mt-1">Quản lý khách hàng & tích điểm</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Thêm khách hàng</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Khách hàng</th>
                <th className="table-header">Điện thoại</th>
                <th className="table-header">Email</th>
                <th className="table-header">Địa chỉ</th>
                <th className="table-header text-center">Điểm tích lũy</th>
                <th className="table-header text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UsersIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {c.phone || '-'}
                    </div>
                  </td>
                  <td className="table-cell text-sm">{c.email || '-'}</td>
                  <td className="table-cell text-sm text-gray-500 max-w-[200px] truncate">{c.address || '-'}</td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Gift className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-yellow-600">{c.loyalty_points || 0}</span>
                    </div>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => viewLoyaltyHistory(c)} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded" title="Lịch sử tích điểm">
                        <History className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(c)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(c.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Chưa có khách hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editItem ? 'Sửa khách hàng' : 'Thêm khách hàng'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ tên *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Điện thoại</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
                </div>
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

      {/* Loyalty History Modal */}
      {loyaltyHistory && loyaltyCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">Lịch sử tích điểm</h3>
                <p className="text-sm text-gray-500">{loyaltyCustomer.name} - {loyaltyCustomer.phone}</p>
              </div>
              <button onClick={() => { setLoyaltyHistory(null); setLoyaltyCustomer(null); }} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-yellow-50 border-b">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-yellow-700">Điểm hiện tại: {loyaltyCustomer.loyalty_points || 0}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loyaltyHistory.length === 0 ? (
                <p className="text-center text-gray-400 py-4">Chưa có lịch sử tích điểm</p>
              ) : (
                <div className="space-y-3">
                  {loyaltyHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{h.description || 'Tích điểm đơn hàng'}</p>
                        <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                      <span className={`font-bold ${h.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {h.points > 0 ? '+' : ''}{h.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Xóa khách hàng" message="Bạn có chắc muốn xóa khách hàng này? Điểm tích lũy sẽ bị mất." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmText="Xóa" danger />
    </div>
  );
}
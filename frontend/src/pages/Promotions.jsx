import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, X, Tag, Copy, BarChart3 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Promotions() {
  const toast = useToast();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    code: '', name: '', description: '', discount_type: 'percent', discount_value: '',
    min_order: '', max_discount: '', max_uses: '', start_date: '', end_date: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/promotions');
      setPromotions(res.data.data?.data || res.data.data?.items || res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ code: '', name: '', description: '', discount_type: 'percent', discount_value: '', min_order: '', max_discount: '', max_uses: '', start_date: '', end_date: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      code: item.code, name: item.name, description: item.description || '',
      discount_type: item.discount_type, discount_value: item.discount_value,
      min_order: item.min_order || '', max_discount: item.max_discount || '',
      max_uses: item.max_uses || '', start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        discount_value: parseFloat(form.discount_value),
        min_order: form.min_order ? parseFloat(form.min_order) : null,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (editItem) {
        await api.put(`/promotions/${editItem.id}`, payload);
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        await api.post('/promotions', payload);
        toast.success('Tạo khuyến mãi thành công');
      }
      setShowModal(false);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi lưu khuyến mãi'); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/promotions/${deleteTarget}`);
      toast.success('Xóa khuyến mãi thành công');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi xóa khuyến mãi'); }
    finally { setDeleteTarget(null); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  const formatCurrency = (v) => v ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '-';

  const isExpired = (end) => end && new Date(end) < new Date();
  const isNotStarted = (start) => start && new Date(start) > new Date();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Khuyến mãi</h2>
          <p className="text-gray-500 mt-1">Quản lý mã giảm giá & chương trình khuyến mãi</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Tạo khuyến mãi</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map(p => {
          const expired = isExpired(p.end_date);
          const notStarted = isNotStarted(p.start_date);
          return (
            <div key={p.id} className={`card hover:shadow-md transition-shadow ${expired ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${expired ? 'bg-gray-100' : 'bg-green-100'}`}>
                    <Tag className={`w-5 h-5 ${expired ? 'text-gray-400' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    <button onClick={() => copyCode(p.code)} className="flex items-center gap-1 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200">
                      {p.code} <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              {p.description && <p className="text-xs text-gray-500 mb-2">{p.description}</p>}
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Giảm giá:</span>
                  <span className="font-bold text-primary-600">
                    {p.discount_type === 'percent' ? `${p.discount_value}%` : formatCurrency(p.discount_value)}
                    {p.max_discount && ` (tối đa ${formatCurrency(p.max_discount)})`}
                  </span>
                </div>
                {p.min_order && <div className="flex justify-between"><span className="text-gray-500">Đơn tối thiểu:</span><span>{formatCurrency(p.min_order)}</span></div>}
                <div className="flex justify-between">
                  <span className="text-gray-500">Đã dùng:</span>
                  <span>{p.used_count}{p.max_uses ? `/${p.max_uses}` : ''}</span>
                </div>
                {p.start_date && <div className="flex justify-between"><span className="text-gray-500">Từ:</span><span>{new Date(p.start_date).toLocaleDateString('vi-VN')}</span></div>}
                {p.end_date && <div className="flex justify-between"><span className="text-gray-500">Đến:</span><span>{new Date(p.end_date).toLocaleDateString('vi-VN')}</span></div>}
              </div>

              <div className="mt-2">
                {expired ? <span className="badge-danger">Hết hạn</span> :
                 notStarted ? <span className="badge-warning">Chưa bắt đầu</span> :
                 <span className="badge-success">Đang hoạt động</span>}
              </div>
            </div>
          );
        })}
        {promotions.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">Chưa có khuyến mãi nào</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editItem ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mã khuyến mãi *</label>
                  <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="input-field font-mono" placeholder="SUMMER2024" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tên chương trình *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loại giảm giá *</label>
                  <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})} className="input-field">
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giá trị giảm *</label>
                  <input type="number" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Đơn tối thiểu</label>
                  <input type="number" value={form.min_order} onChange={e => setForm({...form, min_order: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giảm tối đa</label>
                  <input type="number" value={form.max_discount} onChange={e => setForm({...form, max_discount: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số lần sử dụng tối đa</label>
                <input type="number" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} className="input-field" placeholder="Để trống = không giới hạn" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="input-field" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSave} className="btn-primary">{editItem ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Xóa khuyến mãi" message="Bạn có chắc muốn xóa khuyến mãi này?" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmText="Xóa" danger />
    </div>
  );
}
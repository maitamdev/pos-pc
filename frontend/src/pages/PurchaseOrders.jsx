import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Search, X, Package, Truck, Eye, CheckCircle, XCircle } from 'lucide-react';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

export default function PurchaseOrders() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [form, setForm] = useState({ supplier_id: '', notes: '', expected_date: '', items: [] });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 1, unit_cost: 0 });

  useEffect(() => { loadData(1); }, []);

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/purchase-orders?${params.toString()}`);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadDropdowns = async () => {
    try {
      const [supRes, prodRes] = await Promise.all([
        api.get('/suppliers?limit=100'),
        api.get('/products?limit=100')
      ]);
      setSuppliers(supRes.data.data || supRes.data.items || []);
      setProducts(prodRes.data.data || prodRes.data.items || []);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => {
    setForm({ supplier_id: '', notes: '', expected_date: '', items: [] });
    setShowModal(true);
    loadDropdowns();
  };

  const addItem = () => {
    if (!newItem.product_id) return;
    const prod = products.find(p => p.id == newItem.product_id);
    if (!prod) return;
    const item = { ...newItem, product_name: prod.name, unit_cost: parseFloat(newItem.unit_cost) || prod.cost_price };
    setForm({ ...form, items: [...form.items, item] });
    setNewItem({ product_id: '', quantity: 1, unit_cost: 0 });
  };

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!form.supplier_id || form.items.length === 0) {
      toast.warning('Vui lòng chọn nhà cung cấp và thêm ít nhất 1 sản phẩm');
      return;
    }
    try {
      const subtotal = form.items.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0);
      await api.post('/purchase-orders', { ...form, subtotal, total: subtotal });
      toast.success('Tạo đơn nhập hàng thành công');
      setShowModal(false);
      loadData(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi tạo đơn nhập'); }
  };

  const handleReceive = async (id) => {
    try {
      await api.put(`/purchase-orders/${id}/receive`);
      toast.success('Nhập kho thành công');
      loadData(pagination.page);
      if (viewItem?.id === id) {
        const res = await api.get(`/purchase-orders/${id}`);
        setViewItem(res.data.data);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi nhập kho'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/purchase-orders/${id}/status`, { status: 'cancelled' });
      toast.success('Hủy đơn nhập thành công');
      loadData(pagination.page);
      setConfirmAction(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi hủy đơn'); }
  };

  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/purchase-orders/${id}`);
      setViewItem(res.data.data);
    } catch (err) { console.error(err); }
  };

  const statusColors = { draft: 'bg-gray-100 text-gray-700', ordered: 'bg-blue-100 text-blue-700', received: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  const statusLabels = { draft: 'Nháp', ordered: 'Đã đặt', received: 'Đã nhập', cancelled: 'Đã hủy' };
  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Đơn nhập hàng</h2>
          <p className="text-gray-500 mt-1">Quản lý đơn nhập hàng từ nhà cung cấp</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Tạo đơn nhập</button>
      </div>

      <div className="card flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm mã đơn, nhà cung cấp..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadData(1)} className="input-field pl-10" />
          </div>
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); }} className="input-field w-auto">
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="ordered">Đã đặt</option>
          <option value="received">Đã nhập</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <button onClick={() => loadData(1)} className="btn-secondary">Tìm kiếm</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Mã đơn</th>
                <th className="table-header">Nhà cung cấp</th>
                <th className="table-header">Nhân viên</th>
                <th className="table-header">Ngày tạo</th>
                <th className="table-header text-right">Tổng tiền</th>
                <th className="table-header text-center">Trạng thái</th>
                <th className="table-header text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(po => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{po.po_code}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400" /> {po.supplier_name}</div>
                  </td>
                  <td className="table-cell text-sm">{po.user_name}</td>
                  <td className="table-cell text-sm">{new Date(po.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="table-cell text-right font-medium">{formatCurrency(po.total)}</td>
                  <td className="table-cell text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[po.status]}`}>{statusLabels[po.status]}</span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => viewDetail(po.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                      {po.status === 'draft' && (
                        <>
                          <button onClick={() => handleReceive(po.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Nhập kho"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmAction({ id: po.id, action: () => handleCancel(po.id) })} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Hủy"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Chưa có đơn nhập hàng nào</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={loadData} />
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Tạo đơn nhập hàng</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nhà cung cấp *</label>
                  <select value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})} className="input-field">
                    <option value="">-- Chọn NCC --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày dự kiến</label>
                  <input type="date" value={form.expected_date} onChange={e => setForm({...form, expected_date: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" />
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Chi tiết sản phẩm</h4>
                <div className="flex gap-2 mb-3">
                  <select value={newItem.product_id} onChange={e => {
                    const prod = products.find(p => p.id == e.target.value);
                    setNewItem({...newItem, product_id: e.target.value, unit_cost: prod?.cost_price || 0});
                  }} className="input-field flex-1">
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
                  </select>
                  <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})} className="input-field w-20" placeholder="SL" />
                  <input type="number" min="0" value={newItem.unit_cost} onChange={e => setNewItem({...newItem, unit_cost: parseFloat(e.target.value) || 0})} className="input-field w-32" placeholder="Đơn giá" />
                  <button onClick={addItem} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
                </div>
                {form.items.length > 0 && (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Sản phẩm</th>
                        <th className="px-3 py-2 text-right">SL</th>
                        <th className="px-3 py-2 text-right">Đơn giá</th>
                        <th className="px-3 py-2 text-right">Thành tiền</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{item.product_name}</td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(item.unit_cost)}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.quantity * item.unit_cost)}</td>
                          <td className="px-3 py-2 text-right"><button onClick={() => removeItem(idx)} className="text-red-500"><X className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 font-bold">
                      <tr><td colSpan={3} className="px-3 py-2 text-right">Tổng:</td><td className="px-3 py-2 text-right">{formatCurrency(form.items.reduce((s, i) => s + i.quantity * i.unit_cost, 0))}</td><td></td></tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSave} className="btn-primary">Tạo đơn nhập</button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">Chi tiết đơn nhập {viewItem.po_code}</h3>
                <p className="text-sm text-gray-500">Nhà cung cấp: {viewItem.supplier_name}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div><p className="text-xs text-gray-500">Trạng thái</p><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[viewItem.status]}`}>{statusLabels[viewItem.status]}</span></div>
                <div><p className="text-xs text-gray-500">Ngày tạo</p><p className="font-medium">{new Date(viewItem.created_at).toLocaleDateString('vi-VN')}</p></div>
                <div><p className="text-xs text-gray-500">Tổng tiền</p><p className="font-bold text-lg">{formatCurrency(viewItem.total)}</p></div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr><th className="px-3 py-2 text-left">Sản phẩm</th><th className="px-3 py-2 text-right">SL</th><th className="px-3 py-2 text-right">Đơn giá</th><th className="px-3 py-2 text-right">Thành tiền</th></tr>
                </thead>
                <tbody>
                  {viewItem.details?.map((d, i) => (
                    <tr key={i} className="border-t"><td className="px-3 py-2">{d.product_name}</td><td className="px-3 py-2 text-right">{d.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(d.unit_cost)}</td><td className="px-3 py-2 text-right">{formatCurrency(d.subtotal)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmAction} title="Hủy đơn nhập hàng" message="Bạn có chắc muốn hủy đơn nhập này?" onConfirm={() => confirmAction?.action()} onCancel={() => setConfirmAction(null)} confirmText="Hủy đơn" danger />
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Search, X, Eye, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Returns() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [form, setForm] = useState({ order_id: '', reason: '', refund_method: 'cash', items: [] });
  const [orderDetail, setOrderDetail] = useState(null);

  useEffect(() => { loadData(1); }, []);

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/returns?${params.toString()}`);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadOrderDetail = async (orderId) => {
    if (!orderId) { setOrderDetail(null); return; }
    try {
      const res = await api.get(`/orders/${orderId}`);
      const order = res.data.data;
      setOrderDetail(order);
      setForm({
        ...form,
        order_id: orderId,
        items: (order.items || []).map(i => ({
          product_id: i.product_id, product_name: i.product_name,
          quantity: 1, max_qty: i.quantity, unit_price: i.unit_price
        }))
      });
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!form.order_id || form.items.filter(i => i.quantity > 0).length === 0) {
      toast.warning('Vui lòng chọn đơn hàng và số lượng trả');
      return;
    }
    try {
      const returnItems = form.items.filter(i => i.quantity > 0).map(i => ({
        ...i, subtotal: i.quantity * i.unit_price
      }));
      const total_refund = returnItems.reduce((s, i) => s + i.subtotal, 0);
      await api.post('/returns', { ...form, items: returnItems, total_refund });
      toast.success('Tạo phiếu trả hàng thành công');
      setShowModal(false);
      loadData(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi tạo phiếu trả'); }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/returns/${id}/status`, { status: 'approved' });
      toast.success('Duyệt phiếu trả hàng thành công');
      loadData(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi duyệt phiếu'); }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/returns/${id}/status`, { status: 'completed' });
      toast.success('Hoàn tiền thành công');
      loadData(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi hoàn tiền'); }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/returns/${id}/status`, { status: 'rejected' });
      toast.success('Từ chối phiếu trả hàng');
      loadData(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/returns/${id}`);
      setViewItem(res.data.data?.data || res.data.data?.items || res.data.data);
    } catch (err) { console.error(err); }
  };

  const statusColors = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
  const statusLabels = { pending: 'Chờ duyệt', approved: 'Đã duyệt', completed: 'Hoàn thành', rejected: 'Từ chối' };
  const refundLabels = { cash: 'Tiền mặt', banking: 'Chuyển khoản', card: 'Thẻ', store_credit: 'Tín dụng cửa hàng' };
  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Trả hàng / Hoàn tiền</h2>
          <p className="text-gray-500 mt-1">Quản lý trả hàng và hoàn tiền cho khách</p>
        </div>
        <button onClick={() => { setShowModal(true); setForm({ order_id: '', reason: '', refund_method: 'cash', items: [] }); setOrderDetail(null); }} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Tạo phiếu trả</button>
      </div>

      <div className="card flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm mã phiếu, mã đơn..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadData(1)} className="input-field pl-10" />
          </div>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="completed">Hoàn thành</option>
          <option value="rejected">Từ chối</option>
        </select>
        <button onClick={() => loadData(1)} className="btn-secondary">Tìm kiếm</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="table-header">Mã phiếu</th>
              <th className="table-header">Đơn hàng</th>
              <th className="table-header">Khách hàng</th>
              <th className="table-header">Ngày tạo</th>
              <th className="table-header text-right">Hoàn tiền</th>
              <th className="table-header text-center">Trạng thái</th>
              <th className="table-header text-right">Thao tác</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{r.return_code}</td>
                  <td className="table-cell">{r.order_code}</td>
                  <td className="table-cell">{r.customer_name || 'Khách lẻ'}</td>
                  <td className="table-cell text-sm">{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="table-cell text-right font-medium text-red-600">{formatCurrency(r.total_refund)}</td>
                  <td className="table-cell text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>{statusLabels[r.status]}</span></td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => viewDetail(r.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(r.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Duyệt"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmAction({ action: () => handleReject(r.id) })} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Từ chối"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button onClick={() => handleComplete(r.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Hoàn thành"><RotateCcw className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Chưa có phiếu trả hàng nào</td></tr>}
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
              <h3 className="text-lg font-semibold">Tạo phiếu trả hàng</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mã đơn hàng *</label>
                  <input type="number" placeholder="Nhập ID đơn hàng" value={form.order_id} onChange={e => { setForm({...form, order_id: e.target.value }); loadOrderDetail(e.target.value); }} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phương thức hoàn tiền</label>
                  <select value={form.refund_method} onChange={e => setForm({...form, refund_method: e.target.value})} className="input-field">
                    <option value="cash">Tiền mặt</option>
                    <option value="banking">Chuyển khoản</option>
                    <option value="card">Thẻ</option>
                    <option value="store_credit">Tín dụng cửa hàng</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lý do trả hàng</label>
                <input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="input-field" />
              </div>
              {orderDetail && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Đơn hàng: {orderDetail.order_code} - {formatCurrency(orderDetail.total)}</p>
                  <h4 className="font-medium mb-3">Chọn sản phẩm trả</h4>
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 mb-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1 text-sm">{item.product_name}</span>
                      <span className="text-xs text-gray-500">Tối đa: {item.max_qty}</span>
                      <input type="number" min="0" max={item.max_qty} value={item.quantity} onChange={e => {
                        const newItems = [...form.items];
                        newItems[idx].quantity = Math.min(parseInt(e.target.value) || 0, item.max_qty);
                        setForm({...form, items: newItems});
                      }} className="input-field w-20" />
                      <span className="text-sm font-medium w-24 text-right">{formatCurrency(item.quantity * item.unit_price)}</span>
                    </div>
                  ))}
                  <div className="text-right font-bold mt-2">Tổng hoàn: {formatCurrency(form.items.reduce((s, i) => s + i.quantity * i.unit_price, 0))}</div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSave} className="btn-primary">Tạo phiếu trả</button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">Chi tiết {viewItem.return_code}</h3>
                <p className="text-sm text-gray-500">Đơn: {viewItem.order_code} | {viewItem.customer_name || 'Khách lẻ'}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-xs text-gray-500">Trạng thái</p><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[viewItem.status]}`}>{statusLabels[viewItem.status]}</span></div>
                <div><p className="text-xs text-gray-500">Hoàn tiền</p><p className="font-bold text-red-600">{formatCurrency(viewItem.total_refund)}</p></div>
                <div><p className="text-xs text-gray-500">Phương thức</p><p>{refundLabels[viewItem.refund_method]}</p></div>
                <div><p className="text-xs text-gray-500">Lý do</p><p>{viewItem.reason || '-'}</p></div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Sản phẩm</th><th className="px-3 py-2 text-right">SL</th><th className="px-3 py-2 text-right">Thành tiền</th></tr></thead>
                <tbody>
                  {viewItem.details?.map((d, i) => (
                    <tr key={i} className="border-t"><td className="px-3 py-2">{d.product_name}</td><td className="px-3 py-2 text-right">{d.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(d.subtotal)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmAction} title="Từ chối trả hàng" message="Bạn có chắc muốn từ chối phiếu trả hàng này?" onConfirm={() => confirmAction?.action()} onCancel={() => setConfirmAction(null)} confirmText="Từ chối" danger />
    </div>
  );
}
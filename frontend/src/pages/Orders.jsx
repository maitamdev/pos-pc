import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Plus, Minus, Trash2, Search, X, CreditCard, Banknote, QrCode, Receipt, Eye, Printer } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import OrderDetailModal from '../components/OrderDetailModal';
import PrintReceipt from '../components/PrintReceipt';
import Pagination from '../components/Pagination';

export default function Orders() {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [promotionCode, setPromotionCode] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pos');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [orderPagination, setOrderPagination] = useState(null);
  const [orderPage, setOrderPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prodRes, custRes, orderRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers'),
        api.get('/orders'),
      ]);
      const productData = prodRes.data.data;
      const productsArray = Array.isArray(productData) ? productData : (productData?.data || []);
      setProducts(productsArray);
      setFilteredProducts(productsArray);
      
      const custData = custRes.data.data;
      setCustomers(Array.isArray(custData) ? custData : (custData?.data || []));
      
      const orderData = orderRes.data.data;
      if (Array.isArray(orderData)) {
        setOrders(orderData);
      } else if (orderData && orderData.data) {
        setOrders(orderData.data);
        setOrderPagination(orderData.pagination);
      } else if (orderData && orderData.items) {
        setOrders(orderData.items);
        setOrderPagination(orderData.pagination);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSearchProduct = (q) => {
    setSearchProduct(q);
    if (!q) { setFilteredProducts(products); return; }
    setFilteredProducts(products.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())
    ));
  };

  const addToCart = (product) => {
    const existing = cart.find(c => c.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) { toast.warning('Vượt quá tồn kho!'); return; }
      setCart(cart.map(c => c.product_id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      if (product.stock <= 0) { toast.warning('Sản phẩm hết hàng!'); return; }
      setCart([...cart, { product_id: product.id, name: product.name, price: product.selling_price, quantity: 1, stock: product.stock }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(c => {
      if (c.product_id === id) {
        const newQty = c.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > c.stock) { toast.warning('Vượt quá tồn kho!'); return c; }
        return { ...c, quantity: newQty };
      }
      return c;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => setCart(cart.filter(c => c.product_id !== id));

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) { toast.warning('Giỏ hàng trống!'); return; }
    setSubmitting(true);
    try {
      const payload = {
        customer_id: selectedCustomer || null,
        items: cart.map(c => ({ product_id: c.product_id, quantity: c.quantity })),
        promotion_code: promotionCode || null,
        payment_method: paymentMethod,
        notes: notes || null,
      };
      const res = await api.post('/orders', payload);
      toast.success('Tạo đơn hàng thành công!');
      setCart([]);
      setSelectedCustomer('');
      setPromotionCode('');
      setNotes('');
      loadData();
      // Show order detail after creation
      if (res.data?.data) {
        setOrderDetail(res.data.data);
        setShowDetail(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tạo đơn hàng');
    } finally { setSubmitting(false); }
  };

  const handleCancelOrder = (id) => {
    setConfirmCancel(id);
  };

  const confirmCancelOrder = async () => {
    if (!confirmCancel) return;
    try {
      await api.put(`/orders/${confirmCancel}/cancel`);
      toast.success('Hủy đơn hàng thành công');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi hủy đơn hàng');
    } finally { setConfirmCancel(null); }
  };

  const loadOrders = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (orderSearch) params.append('search', orderSearch);
      const orderRes = await api.get(`/orders?${params}`);
      const orderData = orderRes.data.data;
      if (Array.isArray(orderData)) {
        setOrders(orderData);
      } else if (orderData && orderData.data) {
        setOrders(orderData.data);
        setOrderPagination(orderData.pagination);
      } else if (orderData && orderData.items) {
        setOrders(orderData.items);
        setOrderPagination(orderData.pagination);
      }
      setOrderPage(page);
    } catch (err) { console.error(err); }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrderDetail(res.data.data);
      setShowDetail(true);
    } catch (err) {
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const paymentIcons = { cash: Banknote, banking: CreditCard, qr: QrCode, card: CreditCard };
  const paymentLabels = { cash: 'Tiền mặt', banking: 'Chuyển khoản', qr: 'QR Code', card: 'Thẻ' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bán hàng</h2>
          <p className="text-gray-500 mt-1">POS & Quản lý đơn hàng</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('pos')} className={activeTab === 'pos' ? 'btn-primary' : 'btn-secondary'}>POS</button>
          <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}>Lịch sử đơn</button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Tìm sản phẩm..." value={searchProduct} onChange={e => handleSearchProduct(e.target.value)} className="input-field pl-10" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                {filteredProducts.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="p-3 border rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                    <p className="text-sm font-bold text-primary-600 mt-1">{formatCurrency(p.selling_price)}</p>
                    <p className={`text-xs ${p.stock <= 0 ? 'text-red-500 font-bold' : p.stock <= p.min_stock_level ? 'text-orange-500' : 'text-gray-400'}`}>
                      {p.stock <= 0 ? 'Hết hàng' : `Kho: ${p.stock}`}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold">Giỏ hàng ({cart.length})</h3>
            </div>

            {/* Customer */}
            <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="input-field text-sm">
              <option value="">-- Khách lẻ --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
            </select>

            {/* Cart items */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Chưa có sản phẩm</p>
              ) : cart.map(c => (
                <div key={c.product_id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(c.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(c.product_id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center text-sm font-medium">{c.quantity}</span>
                    <button onClick={() => updateQty(c.product_id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="text-sm font-bold w-24 text-right">{formatCurrency(c.price * c.quantity)}</p>
                  <button onClick={() => removeFromCart(c.product_id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            {/* Promotion */}
            <input type="text" placeholder="Mã khuyến mãi" value={promotionCode} onChange={e => setPromotionCode(e.target.value)} className="input-field text-sm" />

            {/* Payment method */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(paymentLabels).map(([key, label]) => {
                const Icon = paymentIcons[key];
                return (
                  <button key={key} onClick={() => setPaymentMethod(key)}
                    className={`p-2 rounded-lg text-center text-xs font-medium transition-all ${paymentMethod === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Icon className="w-4 h-4 mx-auto mb-1" />{label}
                  </button>
                );
              })}
            </div>

            {/* Notes */}
            <textarea placeholder="Ghi chú..." value={notes} onChange={e => setNotes(e.target.value)} className="input-field text-sm" rows={2} />

            {/* Total & Submit */}
            <div className="border-t pt-3 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-primary-600">{formatCurrency(subtotal)}</span>
              </div>
              <button onClick={handleSubmitOrder} disabled={submitting || cart.length === 0}
                className="w-full btn-success py-3 text-base flex items-center justify-center gap-2">
                <Receipt className="w-5 h-5" />
                {submitting ? 'Đang xử lý...' : 'Thanh toán'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Order history */
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Tìm mã đơn, tên KH, SĐT..." value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadOrders(1)}
                className="input-field pl-10" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Mã đơn</th>
                  <th className="table-header">Khách hàng</th>
                  <th className="table-header">Nhân viên</th>
                  <th className="table-header text-right">Tổng tiền</th>
                  <th className="table-header">Thanh toán</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Ngày tạo</th>
                  <th className="table-header text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">{o.order_code}</td>
                    <td className="table-cell">{o.customer_name || 'Khách lẻ'}</td>
                    <td className="table-cell">{o.staff_name}</td>
                    <td className="table-cell text-right font-medium">{formatCurrency(o.total)}</td>
                    <td className="table-cell">
                      <span className="badge-info">{paymentLabels[o.payment_method] || o.payment_method}</span>
                    </td>
                    <td className="table-cell">
                      <span className={o.status === 'completed' ? 'badge-success' : o.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}>
                        {o.status === 'completed' ? 'Hoàn thành' : o.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="table-cell text-xs">{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleViewDetail(o.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </button>
                        {o.status === 'completed' && (
                          <>
                            <button onClick={() => setPrintOrder(o)} className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="In hóa đơn">
                              <Printer className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleCancelOrder(o.id)} className="btn-danger text-xs py-1 px-2">Hủy</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">Chưa có đơn hàng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={orderPagination} onPageChange={loadOrders} />
        </div>
      )}

      <OrderDetailModal open={showDetail} order={orderDetail} onClose={() => { setShowDetail(false); setOrderDetail(null); }} />

      {printOrder && <PrintReceipt order={printOrder} onClose={() => setPrintOrder(null)} />}

      <ConfirmDialog
        open={!!confirmCancel}
        title="Hủy đơn hàng"
        message="Bạn có chắc muốn hủy đơn hàng này? Tồn kho sẽ được hoàn lại."
        onConfirm={confirmCancelOrder}
        onCancel={() => setConfirmCancel(null)}
        confirmText="Hủy đơn"
        danger
      />
    </div>
  );
}
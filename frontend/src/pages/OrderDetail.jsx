import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft } from 'lucide-react';

const fmt = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ';

export default function OrderDetail() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data?.data || res.data.data?.items || res.data.data))
      .catch(() => addToast('Không tìm thấy hóa đơn', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
  if (!order) return null;

  const statusMap = { pending: 'Chờ xử lý', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
  const payMap = { cash: 'Tiền mặt', banking: 'Chuyển khoản', qr: 'QR', card: 'Thẻ' };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/orders" className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-800">Chi tiết hóa đơn #{order.order_code}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div><p className="text-sm text-slate-500">Mã đơn hàng</p><p className="font-semibold">{order.order_code}</p></div>
          <div><p className="text-sm text-slate-500">Ngày tạo</p><p className="font-semibold">{new Date(order.created_at).toLocaleString('vi-VN')}</p></div>
          <div><p className="text-sm text-slate-500">Nhân viên</p><p className="font-semibold">{order.staff_name}</p></div>
          <div><p className="text-sm text-slate-500">Khách hàng</p><p className="font-semibold">{order.customer_name || 'Khách lẻ'} {order.customer_phone ? `(${order.customer_phone})` : ''}</p></div>
          <div><p className="text-sm text-slate-500">Phương thức thanh toán</p><p className="font-semibold">{payMap[order.payment_method]}</p></div>
          <div><p className="text-sm text-slate-500">Trạng thái</p><p className={`font-semibold ${order.status === 'completed' ? 'text-green-600' : order.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>{statusMap[order.status]}</p></div>
        </div>

        <h2 className="text-lg font-semibold mb-3">Chi tiết sản phẩm</h2>
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 text-slate-500">Sản phẩm</th>
              <th className="text-center py-2 text-slate-500">SL</th>
              <th className="text-right py-2 text-slate-500">Đơn giá</th>
              <th className="text-right py-2 text-slate-500">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2">{item.product_name}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{fmt(item.unit_price)}</td>
                <td className="py-2 text-right font-semibold">{fmt(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t pt-4 space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between text-sm"><span className="text-slate-500">Tạm tính:</span><span>{fmt(order.subtotal)}</span></div>
          {order.discount_amount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Giảm giá:</span><span>-{fmt(order.discount_amount)}</span></div>}
          <div className="flex justify-between text-xl font-bold border-t pt-2"><span>Tổng cộng:</span><span className="text-primary-600">{fmt(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}

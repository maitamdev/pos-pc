import { X, Printer, ShoppingCart } from 'lucide-react';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
const paymentLabels = { cash: 'Tiền mặt', banking: 'Chuyển khoản', qr: 'QR Code', card: 'Thẻ' };

export default function OrderDetailModal({ open, order, onClose }) {
  if (!open || !order) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa đơn ${order.order_code}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 13px; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
          .header h1 { font-size: 18px; margin: 0 0 5px 0; }
          .header p { margin: 2px 0; font-size: 11px; }
          .info { margin-bottom: 10px; font-size: 12px; }
          .info p { margin: 3px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th { text-align: left; padding: 4px 0; border-bottom: 1px dashed #000; font-size: 11px; }
          td { padding: 4px 0; font-size: 12px; }
          .text-right { text-align: right; }
          .total-section { border-top: 2px dashed #000; padding-top: 8px; margin-top: 8px; }
          .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
          .grand-total { font-size: 16px; font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 20px; border-top: 2px dashed #000; padding-top: 10px; font-size: 11px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>COMPUTER POS</h1>
          <p>Hệ thống quản lý cửa hàng máy tính</p>
          <p>Địa chỉ: 123 Example Street, HN</p>
          <p>ĐT: 0123.456.789</p>
        </div>
        <div class="info">
          <p><strong>Hóa đơn:</strong> ${order.order_code}</p>
          <p><strong>Ngày:</strong> ${new Date(order.created_at).toLocaleString('vi-VN')}</p>
          <p><strong>Khách hàng:</strong> ${order.customer_name || 'Khách lẻ'}</p>
          <p><strong>Nhân viên:</strong> ${order.staff_name}</p>
          <p><strong>Thanh toán:</strong> ${paymentLabels[order.payment_method] || order.payment_method}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th class="text-right">SL</th>
              <th class="text-right">Đơn giá</th>
              <th class="text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                <td class="text-right">${formatCurrency(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total-section">
          <div class="total-row">
            <span>Tạm tính:</span>
            <span>${formatCurrency(order.subtotal || order.total)}</span>
          </div>
          ${order.discount_amount > 0 ? `<div class="total-row"><span>Giảm giá:</span><span>-${formatCurrency(order.discount_amount)}</span></div>` : ''}
          <div class="total-row grand-total">
            <span>TỔNG CỘNG:</span>
            <span>${formatCurrency(order.total)}</span>
          </div>
        </div>
        ${order.notes ? `<p style="margin-top:10px;font-size:11px;"><em>Ghi chú: ${order.notes}</em></p>` : ''}
        <div class="footer">
          <p>Cảm ơn quý khách!</p>
          <p>Hẹn gặp lại!</p>
        </div>
        <script>window.onload=function(){window.print();}<\/script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const statusLabel = (s) => {
    if (s === 'completed') return { text: 'Hoàn thành', cls: 'badge-success' };
    if (s === 'cancelled') return { text: 'Đã hủy', cls: 'badge-danger' };
    return { text: 'Chờ xử lý', cls: 'badge-warning' };
  };
  const st = statusLabel(order.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
              <p className="text-sm text-gray-500 font-mono">{order.order_code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Khách hàng</p>
              <p className="font-medium">{order.customer_name || 'Khách lẻ'}</p>
            </div>
            <div>
              <p className="text-gray-500">Nhân viên</p>
              <p className="font-medium">{order.staff_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Thanh toán</p>
              <p className="font-medium">{paymentLabels[order.payment_method] || order.payment_method}</p>
            </div>
            <div>
              <p className="text-gray-500">Trạng thái</p>
              <span className={st.cls}>{st.text}</span>
            </div>
            <div>
              <p className="text-gray-500">Ngày tạo</p>
              <p className="font-medium">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Sản phẩm</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sản phẩm</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">SL</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Đơn giá</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{item.product_name}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="border-t pt-3 space-y-1 text-sm">
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-primary-600">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {order.notes && (
            <p className="text-sm text-gray-500"><strong>Ghi chú:</strong> {order.notes}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button onClick={onClose} className="btn-secondary">Đóng</button>
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Printer className="w-4 h-4" /> In hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
}
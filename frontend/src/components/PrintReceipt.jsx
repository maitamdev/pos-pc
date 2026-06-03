export default function PrintReceipt({ order, onClose }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${order.order_code}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 10px; }
            h2 { text-align: center; margin: 5px 0; font-size: 16px; }
            h3 { text-align: center; margin: 5px 0; font-size: 14px; }
            .info { margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { text-align: left; padding: 3px 0; }
            .right { text-align: right; }
            .total { font-weight: bold; border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px; }
            .footer { text-align: center; margin-top: 15px; font-size: 11px; }
            hr { border: none; border-top: 1px dashed #000; }
          </style>
        </head>
        <body>
          <h2>💻 COMPUTER SHOP</h2>
          <p style="text-align:center; font-size:11px;">Địa chỉ: 123 Nguyễn Huệ, Q.1, TP.HCM</p>
          <p style="text-align:center; font-size:11px;">Điện thoại: 0901 234 567</p>
          <h3>HÓA ĐƠN BÁN HÀNG</h3>
          <div class="info">
            <div>Mã đơn: ${order.order_code}</div>
            <div>Ngày: ${new Date(order.created_at).toLocaleString('vi-VN')}</div>
            <div>Nhân viên: ${order.staff_name}</div>
            ${order.customer_name ? `<div>Khách hàng: ${order.customer_name}</div>` : ''}
          </div>
          <hr />
          <table>
            <thead><tr><th>SP</th><th class="right">SL</th><th class="right">ĐG</th><th class="right">TT</th></tr></thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td class="right">${item.quantity}</td>
                  <td class="right">${Number(item.unit_price).toLocaleString('vi-VN')}</td>
                  <td class="right">${Number(item.subtotal).toLocaleString('vi-VN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <hr />
          <div style="margin-top:8px;">
            <div style="display:flex; justify-content:space-between;"><span>Tạm tính:</span><span>${Number(order.subtotal).toLocaleString('vi-VN')}đ</span></div>
            ${order.discount_amount > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Giảm giá:</span><span>-${Number(order.discount_amount).toLocaleString('vi-VN')}đ</span></div>` : ''}
            <div class="total" style="display:flex; justify-content:space-between; font-size:14px;">
              <span>TỔNG CỘNG:</span><span>${Number(order.total).toLocaleString('vi-VN')}đ</span>
            </div>
            <div style="display:flex; justify-content:space-between;"><span>Thanh toán:</span><span>${order.payment_method === 'cash' ? 'Tiền mặt' : order.payment_method === 'card' ? 'Thẻ' : 'Chuyển khoản'}</span></div>
          </div>
          <div class="footer">
            <p>Cảm ơn quý khách đã mua hàng!</p>
            <p>Hàng đã mua không đổi trả sau 7 ngày.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">In hóa đơn</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Mã đơn:</strong> {order.order_code}</p>
          <p><strong>Khách:</strong> {order.customer_name || 'Khách lẻ'}</p>
          <p><strong>Tổng tiền:</strong> <span className="text-green-600 font-semibold">{Number(order.total).toLocaleString('vi-VN')}đ</span></p>
          <p><strong>Số sản phẩm:</strong> {order.items?.length}</p>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="btn-secondary">Đóng</button>
          <button onClick={handlePrint} className="btn-primary">🖨️ In hóa đơn</button>
        </div>
      </div>
    </div>
  );
}
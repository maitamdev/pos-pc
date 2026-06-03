import { QRCodeSVG } from 'qrcode.react';

export default function VietQR({ bankId, accountNo, accountName, amount, addInfo }) {
  // VietQR format: https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png
  // Or generate QR data string for mobile banking
  const qrData = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo || '')}&accountName=${encodeURIComponent(accountName || '')}`;

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border">
      <p className="text-sm font-medium text-gray-700">Quét mã để chuyển khoản</p>
      <img src={qrData} alt="VietQR" className="w-64 h-64 object-contain" crossOrigin="anonymous" 
        onError={(e) => {
          // Fallback to basic QR if VietQR service unavailable
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="hidden flex-col items-center gap-2">
        <QRCodeSVG value={`${bankId}|${accountNo}|${amount}|${addInfo || ''}`} size={200} />
        <p className="text-xs text-gray-500">Quét bằng ứng dụng ngân hàng</p>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm"><span className="text-gray-500">Ngân hàng:</span> <span className="font-medium">{bankId}</span></p>
        <p className="text-sm"><span className="text-gray-500">Số TK:</span> <span className="font-medium">{accountNo}</span></p>
        <p className="text-sm"><span className="text-gray-500">Chủ TK:</span> <span className="font-medium">{accountName}</span></p>
        <p className="text-lg font-bold text-green-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</p>
      </div>
    </div>
  );
}
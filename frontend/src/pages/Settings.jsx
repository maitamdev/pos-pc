import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Save, Settings as SettingsIcon, Store, Receipt, Bell, Globe } from 'lucide-react';

export default function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data.data || {});
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      await api.put('/settings', settings);
      toast.success('Cập nhật cài đặt thành công');
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi cập nhật'); }
  };

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const SettingField = ({ label, fieldKey, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={settings[fieldKey] || ''} onChange={e => update(fieldKey, e.target.value)} placeholder={placeholder} className="input-field" />
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
          <p className="text-gray-500 mt-1">Quản lý thông tin cửa hàng và cài đặt hệ thống</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Lưu cài đặt</button>
      </div>

      {/* Store Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4"><Store className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold">Thông tin cửa hàng</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingField label="Tên cửa hàng" fieldKey="store_name" placeholder="Computer Store" />
          <SettingField label="Số điện thoại" fieldKey="store_phone" placeholder="0901234567" />
          <SettingField label="Email" fieldKey="store_email" type="email" placeholder="store@example.com" />
          <SettingField label="Địa chỉ" fieldKey="store_address" placeholder="123 ABC, Q.1, TP.HCM" />
          <SettingField label="Mã số thuế" fieldKey="store_tax_code" />
          <SettingField label="Website" fieldKey="store_website" placeholder="https://..." />
        </div>
      </div>

      {/* Receipt Settings */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4"><Receipt className="w-5 h-5 text-green-600" /><h3 className="text-lg font-semibold">Hóa đơn & In ấn</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingField label="Tiền tố mã đơn hàng" fieldKey="order_code_prefix" placeholder="ORD" />
          <SettingField label="Footer hóa đơn" fieldKey="receipt_footer" placeholder="Cảm ơn quý khách!" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thuế VAT (%)</label>
            <input type="number" min="0" max="100" value={settings.vat_rate || ''} onChange={e => update('vat_rate', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tiền tệ</label>
            <select value={settings.currency || 'VND'} onChange={e => update('currency', e.target.value)} className="input-field">
              <option value="VND">VND (₫)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loyalty */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-purple-600" /><h3 className="text-lg font-semibold">Tích điểm & Khuyến mãi</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉ lệ tích điểm (VNĐ/điểm)</label>
            <input type="number" min="1000" value={settings.loyalty_rate || ''} onChange={e => update('loyalty_rate', e.target.value)} className="input-field" placeholder="10000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{"Thông báo hết hàng (SL <)"}</label>
            <input type="number" min="0" value={settings.low_stock_threshold || ''} onChange={e => update('low_stock_threshold', e.target.value)} className="input-field" placeholder="5" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-yellow-600" /><h3 className="text-lg font-semibold">Thông báo</h3></div>
        <div className="space-y-3">
          {[
            { key: 'notify_low_stock', label: 'Thông báo khi sản phẩm sắp hết hàng' },
            { key: 'notify_new_order', label: 'Thông báo khi có đơn hàng mới' },
            { key: 'notify_warranty_expiring', label: 'Thông báo khi bảo hành sắp hết hạn' }
          ].map(item => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings[item.key] === 'true'} onChange={e => update(item.key, e.target.checked ? 'true' : 'false')} className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
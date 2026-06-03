import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Cpu, CheckCircle, AlertTriangle, AlertCircle, ArrowRight, DollarSign } from 'lucide-react';

export default function BuildPC() {
  const [products, setProducts] = useState({});
  const [selected, setSelected] = useState({ cpu: '', mainboard: '', ram: '', vga: '', psu: '' });
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const types = ['cpu', 'mainboard', 'ram', 'vga', 'psu'];
      const responses = await Promise.all(types.map(t => api.get(`/products?component_type=${t}`)));
      const data = {};
      types.forEach((t, i) => { data[t] = responses[i].data.data; });
      setProducts(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const handleCheck = async () => {
    const hasAny = Object.values(selected).some(v => v);
    if (!hasAny) { toast.warning('Vui lòng chọn ít nhất 1 linh kiện!'); return; }
    setChecking(true);
    try {
      const payload = {};
      Object.entries(selected).forEach(([k, v]) => { if (v) payload[`${k}_id`] = parseInt(v); });
      const res = await api.post('/ai/build-pc', payload);
      setResult(res.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi kiểm tra'); } finally { setChecking(false); }
  };

  const handleSuggest = async (productId) => {
    if (!productId) { setSuggestions(null); return; }
    try {
      const res = await api.get(`/ai/suggest/${productId}`);
      setSuggestions(res.data.data);
    } catch (err) { console.error(err); }
  };

  const componentLabels = { cpu: 'CPU', mainboard: 'Mainboard', ram: 'RAM', vga: 'VGA (Card đồ họa)', psu: 'PSU (Nguồn)' };
  const componentColors = { cpu: 'bg-blue-500', mainboard: 'bg-green-500', ram: 'bg-purple-500', vga: 'bg-red-500', psu: 'bg-orange-500' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Cpu className="w-7 h-7 text-primary-600" /> AI Build PC
        </h2>
        <p className="text-gray-500 mt-1">Kiểm tra tương thích & build bộ PC của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component selectors */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(componentLabels).map(([type, label]) => (
            <div key={type} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`${componentColors[type]} w-8 h-8 rounded-lg flex items-center justify-center`}>
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold">{label}</h3>
              </div>
              <select
                value={selected[type]}
                onChange={e => {
                  setSelected({ ...selected, [type]: e.target.value });
                  if (type === 'cpu' || type === 'mainboard') handleSuggest(e.target.value);
                }}
                className="input-field"
              >
                <option value="">-- Chọn {label} --</option>
                {(products[type] || []).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatCurrency(p.selling_price)} {p.socket ? `(${p.socket})` : ''} {p.ram_type ? `[${p.ram_type}]` : ''} {p.power_watt ? `${p.power_watt}W` : ''}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button onClick={handleCheck} disabled={checking} className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra tương thích'}
          </button>
        </div>

        {/* Result panel */}
        <div className="space-y-4">
          {/* Compatibility result */}
          {result && (
            <div className={`card border-2 ${result.compatible ? 'border-green-200' : 'border-red-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                {result.compatible ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                )}
                <h3 className={`text-lg font-bold ${result.compatible ? 'text-green-700' : 'text-red-700'}`}>
                  {result.compatible ? 'Tương thích!' : 'Không tương thích'}
                </h3>
              </div>

              {result.issues && result.issues.length > 0 && (
                <div className="space-y-2 mb-4">
                  {result.issues.map((issue, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${issue.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.components && result.components.length > 0 && (
                <div className="space-y-2 mb-4 border-t pt-3">
                  {result.components.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{c.name}</span>
                      <span className="font-medium">{formatCurrency(c.selling_price)}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.total_price !== undefined && (
                <div className="border-t pt-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold">Tổng tiền:</span>
                  </div>
                  <span className="text-xl font-bold text-primary-600">{result.total_price_formatted}</span>
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          {suggestions && (
            <div className="card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary-600" />
                Gợi ý tương thích cho {suggestions.product?.name}
              </h3>
              {Object.entries(suggestions.suggestions || {}).map(([key, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                return (
                  <div key={key} className="mb-3">
                    <p className="text-sm font-medium text-gray-600 mb-1 capitalize">{key}:</p>
                    <div className="space-y-1">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>{item.name}</span>
                          <span className="font-medium text-primary-600">{formatCurrency(item.selling_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {Object.values(suggestions.suggestions || {}).every(v => !Array.isArray(v) || v.length === 0) && (
                <p className="text-sm text-gray-400">Không có gợi ý</p>
              )}
            </div>
          )}

          {!result && !suggestions && (
            <div className="card text-center py-8 text-gray-400">
              <Cpu className="w-12 h-12 mx-auto mb-2" />
              <p>Chọn linh kiện và nhấn "Kiểm tra tương thích"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
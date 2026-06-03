import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, TrendingUp, Users, Package, Download, Shield, CreditCard, DollarSign, Clock } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [employeeRevenue, setEmployeeRevenue] = useState([]);
  const [categoryRevenue, setCategoryRevenue] = useState([]);
  const [profitData, setProfitData] = useState(null);
  const [rfmData, setRfmData] = useState(null);
  const [agingData, setAgingData] = useState(null);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      const qs = params.toString();
      const [revRes, topRes, empRes, catRes] = await Promise.all([
        api.get(`/reports/revenue${qs ? '?' + qs : ''}`),
        api.get(`/reports/top-products${qs ? '?' + qs : ''}`),
        api.get(`/reports/employee-revenue${qs ? '?' + qs : ''}`),
        api.get(`/reports/category-revenue${qs ? '?' + qs : ''}`),
      ]);
      setRevenue(revRes.data.data?.data || revRes.data.data?.items || revRes.data.data);
      setTopProducts(topRes.data.data?.data || topRes.data.data?.items || topRes.data.data);
      setEmployeeRevenue(empRes.data.data?.data || empRes.data.data?.items || empRes.data.data);
      setCategoryRevenue(catRes.data.data?.data || catRes.data.data?.items || catRes.data.data);
      // Load new reports
      const [profitRes, rfmRes, agingRes, payRes] = await Promise.all([
        api.get(`/reports/profit${qs ? '?' + qs : ''}`).catch(() => ({ data: { data: null } })),
        api.get('/reports/rfm').catch(() => ({ data: { data: null } })),
        api.get('/reports/inventory-aging').catch(() => ({ data: { data: null } })),
        api.get(`/reports/payment-methods${qs ? '?' + qs : ''}`).catch(() => ({ data: { data: [] } })),
      ]);
      setProfitData(profitRes.data.data?.data || profitRes.data.data?.items || profitRes.data.data);
      setRfmData(rfmRes.data.data?.data || rfmRes.data.data?.items || rfmRes.data.data);
      setAgingData(agingRes.data.data?.data || agingRes.data.data?.items || agingRes.data.data);
      setPaymentData(payRes.data.data?.data || payRes.data.data?.items || payRes.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      const res = await api.get(`/reports/export?${params.toString()}`);
      const data = res.data.data;
      
      // Build CSV
      const headers = ['Ngày', 'Mã đơn', 'Khách hàng', 'Nhân viên', 'Tổng tiền', 'Giảm giá', 'Thanh toán', 'Trạng thái'];
      const rows = data.map(d => [
        new Date(d.date).toLocaleDateString('vi-VN'),
        d.order_code,
        d.customer_name || 'Khách lẻ',
        d.staff_name,
        d.total,
        d.discount_amount || 0,
        d.payment_method,
        d.status
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const revenueChartData = revenue.map(d => ({
    date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    revenue: d.revenue / 1000000,
    orders: d.orders,
  }));

  const pieData = categoryRevenue.map(c => ({ name: c.category || 'Khác', value: parseFloat(c.total_revenue) }));

  const tabs = [
    { key: 'revenue', label: 'Doanh thu', icon: TrendingUp },
    { key: 'products', label: 'Sản phẩm', icon: Package },
    { key: 'employees', label: 'Nhân viên', icon: Users },
    { key: 'categories', label: 'Danh mục', icon: Package },
    { key: 'profit', label: 'Lợi nhuận', icon: DollarSign },
    { key: 'payments', label: 'Thanh toán', icon: CreditCard },
    { key: 'rfm', label: 'Khách hàng RFM', icon: Users },
    { key: 'aging', label: 'Tồn kho', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Báo cáo</h2>
        <p className="text-gray-500 mt-1">Phân tích doanh thu & hiệu suất kinh doanh</p>
      </div>

      {/* Date filter */}
      <div className="card flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Từ ngày</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Đến ngày</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field" />
        </div>
        <button onClick={loadAll} className="btn-primary">Xem báo cáo</button>
        <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> Xuất CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === t.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>
      ) : (
        <>
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu</h3>
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={v => `${v}Tr`} />
                      <Tooltip formatter={v => [`${v.toFixed(1)} triệu`, 'Doanh thu']} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-400 text-center py-10">Chưa có dữ liệu</p>}
              </div>
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr>
                      <th className="table-header">Ngày</th>
                      <th className="table-header text-right">Số đơn</th>
                      <th className="table-header text-right">Doanh thu</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {revenue.map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="table-cell">{new Date(d.date).toLocaleDateString('vi-VN')}</td>
                          <td className="table-cell text-right">{d.orders}</td>
                          <td className="table-cell text-right font-medium">{formatCurrency(d.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr>
                    <th className="table-header">#</th>
                    <th className="table-header">Sản phẩm</th>
                    <th className="table-header text-right">Đã bán</th>
                    <th className="table-header text-right">Doanh thu</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProducts.map((p, i) => (
                      <tr key={p.product_id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{i + 1}</td>
                        <td className="table-cell">{p.product_name}</td>
                        <td className="table-cell text-right">{p.total_sold}</td>
                        <td className="table-cell text-right font-medium">{formatCurrency(p.total_revenue)}</td>
                      </tr>
                    ))}
                    {topProducts.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Chưa có dữ liệu</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr>
                    <th className="table-header">#</th>
                    <th className="table-header">Nhân viên</th>
                    <th className="table-header text-right">Số đơn</th>
                    <th className="table-header text-right">Doanh thu</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {employeeRevenue.map((e, i) => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{i + 1}</td>
                        <td className="table-cell">{e.full_name}</td>
                        <td className="table-cell text-right">{e.total_orders}</td>
                        <td className="table-cell text-right font-medium">{formatCurrency(e.total_revenue)}</td>
                      </tr>
                    ))}
                    {employeeRevenue.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Chưa có dữ liệu</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Doanh thu theo danh mục</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-400 text-center py-10">Chưa có dữ liệu</p>}
              </div>
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr>
                      <th className="table-header">Danh mục</th>
                      <th className="table-header text-right">Đã bán</th>
                      <th className="table-header text-right">Doanh thu</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {categoryRevenue.map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              {c.category || 'Khác'}
                            </div>
                          </td>
                          <td className="table-cell text-right">{c.total_sold}</td>
                          <td className="table-cell text-right font-medium">{formatCurrency(c.total_revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profit' && profitData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card text-center"><p className="text-sm text-gray-500">Tổng doanh thu</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(profitData.summary?.total_revenue || 0)}</p></div>
                <div className="card text-center"><p className="text-sm text-gray-500">Tổng vốn</p><p className="text-2xl font-bold text-orange-600">{formatCurrency(profitData.summary?.total_cost || 0)}</p></div>
                <div className="card text-center"><p className="text-sm text-gray-500">Lợi nhuận</p><p className="text-2xl font-bold text-green-600">{formatCurrency(profitData.summary?.total_profit || 0)}</p></div>
              </div>
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="table-header">Ngày</th><th className="table-header text-right">Đơn</th><th className="table-header text-right">Doanh thu</th><th className="table-header text-right">Vốn</th><th className="table-header text-right">Lợi nhuận</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {(profitData.daily || []).map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50"><td className="table-cell">{new Date(d.date).toLocaleDateString('vi-VN')}</td><td className="table-cell text-right">{d.orders}</td><td className="table-cell text-right">{formatCurrency(d.revenue)}</td><td className="table-cell text-right">{formatCurrency(d.cost)}</td><td className="table-cell text-right font-medium text-green-600">{formatCurrency(d.profit)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Thanh toán theo phương thức</h3>
                {paymentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={paymentData.map(p => ({ name: p.payment_method || 'cash', value: parseFloat(p.revenue) }))} cx="50%" cy="50%" innerRadius={60} outerRadius={120} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-400 text-center py-10">Chưa có dữ liệu</p>}
              </div>
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="table-header">Phương thức</th><th className="table-header text-right">Số đơn</th><th className="table-header text-right">Doanh thu</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {paymentData.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50"><td className="table-cell"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />{p.payment_method || 'cash'}</div></td><td className="table-cell text-right">{p.orders}</td><td className="table-cell text-right font-medium">{formatCurrency(p.revenue)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rfm' && rfmData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(rfmData.segments || {}).map(([seg, count]) => {
                  const colors = { VIP: 'bg-red-100 text-red-700', 'Thân thiết': 'bg-green-100 text-green-700', 'Tiềm năng': 'bg-blue-100 text-blue-700', 'Cần chăm sóc': 'bg-yellow-100 text-yellow-700', 'Nguy hiểm': 'bg-gray-100 text-gray-700' };
                  return <div key={seg} className={`card text-center ${colors[seg] || ''}`}><p className="text-2xl font-bold">{count}</p><p className="text-sm">{seg}</p></div>;
                })}
              </div>
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="table-header">Khách hàng</th><th className="table-header">SĐT</th><th className="table-header text-right">Lần mua</th><th className="table-header text-right">Tổng chi</th><th className="table-header text-right">Lần cuối</th><th className="table-header text-center">Phân khúc</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {(rfmData.customers || []).slice(0, 50).map((c, i) => {
                        const segColors = { VIP: 'bg-red-100 text-red-700', 'Thân thiết': 'bg-green-100 text-green-700', 'Tiềm năng': 'bg-blue-100 text-blue-700', 'Cần chăm sóc': 'bg-yellow-100 text-yellow-700', 'Nguy hiểm': 'bg-gray-100 text-gray-700' };
                        return <tr key={c.id} className="hover:bg-gray-50"><td className="table-cell font-medium">{c.name}</td><td className="table-cell">{c.phone}</td><td className="table-cell text-right">{c.frequency}</td><td className="table-cell text-right">{formatCurrency(c.monetary)}</td><td className="table-cell text-right">{c.recency_days ? `${c.recency_days} ngày` : 'Chưa mua'}</td><td className="table-cell text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${segColors[c.segment] || ''}`}>{c.segment}</span></td></tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aging' && agingData && (
            <div className="space-y-6">
              <div className="card text-center"><p className="text-sm text-gray-500">Tổng giá trị tồn kho</p><p className="text-2xl font-bold text-orange-600">{formatCurrency(agingData.total_stock_value || 0)}</p></div>
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="table-header">SKU</th><th className="table-header">Sản phẩm</th><th className="table-header text-right">Tồn kho</th><th className="table-header text-right">Giá trị</th><th className="table-header text-right">Lần bán cuối</th><th className="table-header text-center">Trạng thái</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {(agingData.products || []).slice(0, 50).map((p, i) => {
                        const statusColors = { 'Tốt': 'bg-green-100 text-green-700', 'Chậm': 'bg-yellow-100 text-yellow-700', 'Tồn lâu': 'bg-orange-100 text-orange-700', 'Cần xử lý': 'bg-red-100 text-red-700', 'Chưa bán': 'bg-gray-100 text-gray-700' };
                        return <tr key={p.id} className="hover:bg-gray-50"><td className="table-cell font-mono text-sm">{p.sku}</td><td className="table-cell">{p.name}</td><td className="table-cell text-right">{p.stock}</td><td className="table-cell text-right">{formatCurrency(p.stock_value)}</td><td className="table-cell text-right">{p.last_sold_date ? new Date(p.last_sold_date).toLocaleDateString('vi-VN') : 'Chưa bán'}</td><td className="table-cell text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.aging_status] || ''}`}>{p.aging_status}</span></td></tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
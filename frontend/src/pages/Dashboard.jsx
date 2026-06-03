import { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setData(res.data.data?.data || res.data.data?.items || res.data.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;
  }

  if (!data) {
    return <div className="text-center text-gray-500 py-10">Không thể tải dữ liệu dashboard</div>;
  }

  const stats = [
    { label: 'Doanh thu hôm nay', value: formatCurrency(data.today_revenue), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Đơn hàng hôm nay', value: data.today_orders, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Tổng khách hàng', value: data.total_customers, icon: Users, color: 'bg-purple-500' },
    { label: 'Tổng sản phẩm', value: data.total_products, icon: Package, color: 'bg-orange-500' },
  ];

  const chartData = (data.daily_revenue || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    revenue: d.revenue / 1000000,
    orders: d.orders,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu 7 ngày gần nhất</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${v}Tr`} />
                <Tooltip formatter={(v) => [`${v.toFixed(1)} triệu`, 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Chưa có dữ liệu</p>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-800">Cảnh báo tồn kho</h3>
          </div>
          {data.low_stock && data.low_stock.length > 0 ? (
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {data.low_stock.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sku}</p>
                  </div>
                  <span className="badge-danger">{p.stock}/{p.min_stock_level}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Không có cảnh báo</p>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top sản phẩm bán chạy (30 ngày)</h3>
        {data.top_products && data.top_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Sản phẩm</th>
                  <th className="table-header text-right">Đã bán</th>
                  <th className="table-header text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.top_products.map((p, i) => (
                  <tr key={p.product_id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{i + 1}</td>
                    <td className="table-cell">{p.product_name}</td>
                    <td className="table-cell text-right">{p.total_sold}</td>
                    <td className="table-cell text-right font-medium">{formatCurrency(p.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Chưa có dữ liệu bán hàng</p>
        )}
      </div>
    </div>
  );
}
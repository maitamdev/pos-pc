import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, FileText } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { loadData(1); }, []);

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (actionFilter) params.append('action', actionFilter);
      if (entityFilter) params.append('entity', entityFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      const res = await api.get(`/audit-logs?${params.toString()}`);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const actionColors = { CREATE: 'bg-green-100 text-green-700', UPDATE: 'bg-blue-100 text-blue-700', DELETE: 'bg-red-100 text-red-700', LOGIN: 'bg-purple-100 text-purple-700', LOGOUT: 'bg-gray-100 text-gray-700', RECEIVE: 'bg-yellow-100 text-yellow-700' };
  const entityLabels = { order: 'Đơn hàng', product: 'Sản phẩm', customer: 'Khách hàng', user: 'Nhân viên', purchase_order: 'Đơn nhập', return: 'Trả hàng', warranty: 'Bảo hành', settings: 'Cài đặt' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Nhật ký hoạt động</h2>
        <p className="text-gray-500 mt-1">Theo dõi tất cả hoạt động trong hệ thống</p>
      </div>

      <div className="card flex flex-wrap gap-4">
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="input-field w-auto">
          <option value="">Tất cả hành động</option>
          <option value="CREATE">Tạo mới</option>
          <option value="UPDATE">Cập nhật</option>
          <option value="DELETE">Xóa</option>
          <option value="LOGIN">Đăng nhập</option>
          <option value="RECEIVE">Nhập kho</option>
        </select>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="input-field w-auto">
          <option value="">Tất cả đối tượng</option>
          <option value="order">Đơn hàng</option>
          <option value="product">Sản phẩm</option>
          <option value="customer">Khách hàng</option>
          <option value="purchase_order">Đơn nhập</option>
          <option value="return">Trả hàng</option>
          <option value="warranty">Bảo hành</option>
          <option value="settings">Cài đặt</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field w-auto" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field w-auto" />
        <button onClick={() => loadData(1)} className="btn-secondary flex items-center gap-2"><Search className="w-4 h-4" /> Lọc</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="table-header">Thời gian</th>
              <th className="table-header">Nhân viên</th>
              <th className="table-header text-center">Hành động</th>
              <th className="table-header">Đối tượng</th>
              <th className="table-header">Chi tiết</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="table-cell text-sm">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                  <td className="table-cell font-medium">{log.user_name || 'System'}</td>
                  <td className="table-cell text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-gray-100'}`}>{log.action}</span>
                  </td>
                  <td className="table-cell">{entityLabels[log.entity] || log.entity} {log.entity_id ? `#${log.entity_id}` : ''}</td>
                  <td className="table-cell text-sm text-gray-500 max-w-[300px] truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Chưa có nhật ký nào</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={loadData} />
      </div>
    </div>
  );
}
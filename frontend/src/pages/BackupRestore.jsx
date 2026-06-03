import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Download, Trash2, HardDrive, RefreshCw, FileDown } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function BackupRestore() {
  const toast = useToast();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadBackups(); }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/backup/list');
      setBackups(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const res = await api.post('/backup/create');
      toast.success(`Backup thành công: ${res.data.data.filename}`);
      loadBackups();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi backup'); } finally { setCreating(false); }
  };

  const downloadBackup = (filename) => {
    const token = localStorage.getItem('token');
    const url = `${api.defaults.baseURL}/backup/download/${filename}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const deleteBackup = async (filename) => {
    try {
      await api.delete(`/backup/${filename}`);
      toast.success('Đã xóa backup');
      loadBackups();
    } catch (err) { toast.error('Lỗi xóa backup'); }
    setConfirmDelete(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Backup & Restore</h2>
          <p className="text-gray-500 mt-1">Sao lưu và khôi phục cơ sở dữ liệu</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadBackups} className="btn-secondary flex items-center gap-2"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={createBackup} disabled={creating} className="btn-primary flex items-center gap-2">
            <HardDrive className="w-4 h-4" /> {creating ? 'Đang backup...' : 'Tạo Backup'}
          </button>
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">💡 Backup sẽ xuất toàn bộ cơ dữ liệu ra file SQL. Nên backup định kỳ hàng ngày để đảm bảo an toàn dữ liệu.</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="table-header">Tên file</th>
              <th className="table-header">Kích thước</th>
              <th className="table-header">Ngày tạo</th>
              <th className="table-header text-right">Thao tác</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {backups.map(b => (
                <tr key={b.filename} className="hover:bg-gray-50">
                  <td className="table-cell font-medium flex items-center gap-2"><FileDown className="w-4 h-4 text-gray-400" /> {b.filename}</td>
                  <td className="table-cell">{formatSize(b.size)}</td>
                  <td className="table-cell text-sm">{new Date(b.created_at).toLocaleString('vi-VN')}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => downloadBackup(b.filename)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Tải về"><Download className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDelete(b.filename)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Chưa có backup nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog open={!!confirmDelete} title="Xóa Backup" message={`Bạn có chắc muốn xóa file "${confirmDelete}"?`} onConfirm={() => deleteBackup(confirmDelete)} onCancel={() => setConfirmDelete(null)} confirmText="Xóa" danger />
    </div>
  );
}
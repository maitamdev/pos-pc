import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Edit, Trash2, X, Package } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Products() {
  const { canManage } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    sku: '', name: '', description: '', category_id: '', supplier_id: '',
    cost_price: '', selling_price: '', stock: '0', min_stock_level: '5',
    component_type: '', socket: '', ram_type: '', power_watt: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes, supRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/suppliers'),
      ]);
      setProducts(prodRes.data.data?.data || prodRes.data.data?.items || prodRes.data.data);
      setCategories(catRes.data.data?.data || catRes.data.data?.items || catRes.data.data);
      setSuppliers(supRes.data.data?.data || supRes.data.data?.items || supRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterCategory) params.append('category_id', filterCategory);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data?.data || res.data.data?.items || res.data.data);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ sku: '', name: '', description: '', category_id: '', supplier_id: '', cost_price: '', selling_price: '', stock: '0', min_stock_level: '5', component_type: '', socket: '', ram_type: '', power_watt: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      sku: p.sku, name: p.name, description: p.description || '',
      category_id: p.category_id || '', supplier_id: p.supplier_id || '',
      cost_price: p.cost_price, selling_price: p.selling_price,
      stock: p.stock, min_stock_level: p.min_stock_level,
      component_type: p.component_type || '', socket: p.socket || '',
      ram_type: p.ram_type || '', power_watt: p.power_watt || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        cost_price: parseFloat(form.cost_price),
        selling_price: parseFloat(form.selling_price),
        stock: parseInt(form.stock) || 0,
        min_stock_level: parseInt(form.min_stock_level) || 5,
        category_id: form.category_id || null,
        supplier_id: form.supplier_id || null,
        power_watt: form.power_watt ? parseInt(form.power_watt) : null,
      };
      if (editItem) {
        await api.put(`/products/${editItem.id}`, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await api.post('/products', payload);
        toast.success('Tạo sản phẩm thành công');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu sản phẩm');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget}`);
      toast.success('Xóa sản phẩm thành công');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xóa sản phẩm');
    } finally { setDeleteTarget(null); }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const componentTypes = ['', 'cpu', 'mainboard', 'ram', 'vga', 'psu', 'ssd', 'hdd', 'case', 'cooler'];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sản phẩm</h2>
          <p className="text-gray-500 mt-1">Quản lý danh sách sản phẩm</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Tìm kiếm tên, SKU..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10"
            />
          </div>
        </div>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); }} className="input-field w-auto">
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={handleSearch} className="btn-primary">Lọc</button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">SKU</th>
                <th className="table-header">Tên sản phẩm</th>
                <th className="table-header">Danh mục</th>
                <th className="table-header text-right">Giá nhập</th>
                <th className="table-header text-right">Giá bán</th>
                <th className="table-header text-right">Tồn kho</th>
                <th className="table-header">Loại</th>
                {canManage && <th className="table-header text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-xs">{p.sku}</td>
                  <td className="table-cell font-medium">{p.name}</td>
                  <td className="table-cell">{p.category_name || '-'}</td>
                  <td className="table-cell text-right">{formatCurrency(p.cost_price)}</td>
                  <td className="table-cell text-right font-medium text-primary-600">{formatCurrency(p.selling_price)}</td>
                  <td className="table-cell text-right">
                    <span className={p.stock <= p.min_stock_level ? 'text-red-600 font-bold' : ''}>{p.stock}</span>
                  </td>
                  <td className="table-cell">
                    {p.component_type && <span className="badge-info">{p.component_type}</span>}
                  </td>
                  {canManage && (
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Không có sản phẩm nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU *</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="input-field" disabled={!!editItem} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục</label>
                  <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="input-field">
                    <option value="">-- Chọn --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nhà cung cấp</label>
                  <select value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})} className="input-field">
                    <option value="">-- Chọn --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Giá nhập *</label>
                  <input type="number" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giá bán *</label>
                  <input type="number" value={form.selling_price} onChange={e => setForm({...form, selling_price: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tồn kho</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tồn kho tối thiểu</label>
                  <input type="number" value={form.min_stock_level} onChange={e => setForm({...form, min_stock_level: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Thông tin tương thích (AI Build PC)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại linh kiện</label>
                    <select value={form.component_type} onChange={e => setForm({...form, component_type: e.target.value})} className="input-field">
                      {componentTypes.map(t => <option key={t} value={t}>{t || '-- Không --'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Socket</label>
                    <input value={form.socket} onChange={e => setForm({...form, socket: e.target.value})} className="input-field" placeholder="LGA1700, AM5..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">RAM Type</label>
                    <input value={form.ram_type} onChange={e => setForm({...form, ram_type: e.target.value})} className="input-field" placeholder="DDR4, DDR5..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Công suất (W)</label>
                    <input type="number" value={form.power_watt} onChange={e => setForm({...form, power_watt: e.target.value})} className="input-field" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSave} className="btn-primary">{editItem ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa sản phẩm"
        message="Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Xóa"
        danger
      />
    </div>
  );
}
const pool = require('../config/database');

/**
 * Kiểm tra tương thích giữa các linh kiện PC
 * Rules:
 * - CPU socket phải khớp với Mainboard socket
 * - RAM type phải khớp với Mainboard ram_type
 * - PSU power_watt phải đủ cho tổng công suất (VGA power_watt * 1.5 + 150W base)
 * - Component types phải đúng
 */
const checkCompatibility = async ({ cpu_id, mainboard_id, ram_id, vga_id, psu_id }) => {
  const issues = [];
  const components = {};

  // Fetch all selected components
  const ids = { cpu: cpu_id, mainboard: mainboard_id, ram: ram_id, vga: vga_id, psu: psu_id };

  for (const [type, id] of Object.entries(ids)) {
    if (!id) continue;
    const [rows] = await pool.query(
      'SELECT id, name, component_type, socket, ram_type, power_watt, selling_price FROM products WHERE id = ? AND is_active = 1',
      [id]
    );
    if (rows.length === 0) {
      issues.push({ type: 'error', message: `Không tìm thấy sản phẩm ID ${id}` });
      continue;
    }
    components[type] = rows[0];
  }

  // Check component_type matches
  for (const [type, comp] of Object.entries(components)) {
    if (comp.component_type !== type) {
      issues.push({
        type: 'error',
        message: `${comp.name} không phải là ${type} (loại: ${comp.component_type || 'không xác định'})`
      });
    }
  }

  // CPU <-> Mainboard socket
  if (components.cpu && components.mainboard) {
    if (components.cpu.socket && components.mainboard.socket) {
      if (components.cpu.socket !== components.mainboard.socket) {
        issues.push({
          type: 'error',
          message: `Socket không khớp: CPU (${components.cpu.socket}) vs Mainboard (${components.mainboard.socket})`
        });
      }
    }
  }

  // RAM <-> Mainboard ram_type
  if (components.ram && components.mainboard) {
    if (components.ram.ram_type && components.mainboard.ram_type) {
      if (components.ram.ram_type !== components.mainboard.ram_type) {
        issues.push({
          type: 'error',
          message: `RAM không khớp: ${components.ram.ram_type} vs Mainboard hỗ trợ ${components.mainboard.ram_type}`
        });
      }
    }
  }

  // PSU wattage check
  if (components.psu && components.vga) {
    const requiredWatt = Math.ceil((components.vga.power_watt || 0) * 1.5 + 150);
    if ((components.psu.power_watt || 0) < requiredWatt) {
      issues.push({
        type: 'warning',
        message: `PSU ${components.psu.power_watt}W có thể không đủ. Khuyến nghị tối thiểu ${requiredWatt}W cho VGA ${components.vga.name}`
      });
    }
  }

  const isCompatible = issues.filter(i => i.type === 'error').length === 0;

  return {
    compatible: isCompatible,
    issues,
    components: Object.values(components),
  };
};

/**
 * Build PC: Kiểm tra tương thích + tính tổng tiền
 */
const buildPc = async ({ cpu_id, mainboard_id, ram_id, vga_id, psu_id }) => {
  const compatibility = await checkCompatibility({ cpu_id, mainboard_id, ram_id, vga_id, psu_id });

  let totalPrice = 0;
  for (const comp of compatibility.components) {
    totalPrice += parseFloat(comp.selling_price);
  }

  return {
    ...compatibility,
    total_price: totalPrice,
    total_price_formatted: totalPrice.toLocaleString('vi-VN') + 'đ',
  };
};

/**
 * Gợi ý linh kiện tương thích dựa trên sản phẩm đã chọn
 */
const suggestCompatible = async (productId) => {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE id = ? AND is_active = 1',
    [productId]
  );
  if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy sản phẩm' };

  const product = rows[0];
  const suggestions = {};

  switch (product.component_type) {
    case 'cpu': {
      // Suggest mainboards with same socket
      const [mbs] = await pool.query(
        'SELECT id, name, socket, ram_type, selling_price FROM products WHERE component_type = ? AND socket = ? AND is_active = 1 ORDER BY selling_price ASC',
        ['mainboard', product.socket]
      );
      suggestions.mainboards = mbs;
      break;
    }
    case 'mainboard': {
      // Suggest CPUs with same socket
      const [cpus] = await pool.query(
        'SELECT id, name, socket, selling_price FROM products WHERE component_type = ? AND socket = ? AND is_active = 1 ORDER BY selling_price ASC',
        ['cpu', product.socket]
      );
      suggestions.cpus = cpus;

      // Suggest RAM with same ram_type
      const [rams] = await pool.query(
        'SELECT id, name, ram_type, selling_price FROM products WHERE component_type = ? AND ram_type = ? AND is_active = 1 ORDER BY selling_price ASC',
        ['ram', product.ram_type]
      );
      suggestions.rams = rams;
      break;
    }
    case 'ram': {
      // Suggest mainboards with same ram_type
      const [mbs] = await pool.query(
        'SELECT id, name, socket, ram_type, selling_price FROM products WHERE component_type = ? AND ram_type = ? AND is_active = 1 ORDER BY selling_price ASC',
        ['mainboard', product.ram_type]
      );
      suggestions.mainboards = mbs;
      break;
    }
    case 'vga': {
      // Suggest PSUs with sufficient wattage
      const requiredWatt = Math.ceil((product.power_watt || 0) * 1.5 + 150);
      const [psus] = await pool.query(
        'SELECT id, name, power_watt, selling_price FROM products WHERE component_type = ? AND power_watt >= ? AND is_active = 1 ORDER BY selling_price ASC',
        ['psu', requiredWatt]
      );
      suggestions.psus = psus;
      break;
    }
    case 'psu': {
      // Suggest VGAs that this PSU can handle
      const maxVgaWatt = Math.floor(((product.power_watt || 0) - 150) / 1.5);
      const [vgas] = await pool.query(
        'SELECT id, name, power_watt, selling_price FROM products WHERE component_type = ? AND power_watt <= ? AND is_active = 1 ORDER BY selling_price DESC',
        ['vga', maxVgaWatt > 0 ? maxVgaWatt : 9999]
      );
      suggestions.vgas = vgas;
      break;
    }
    default:
      suggestions.message = 'Sản phẩm này không có gợi ý tương thích đặc biệt';
  }

  return {
    product: { id: product.id, name: product.name, component_type: product.component_type },
    suggestions,
  };
};

module.exports = { buildPc, checkCompatibility, suggestCompatible };
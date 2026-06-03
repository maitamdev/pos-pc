const aiService = require('../services/aiService');
const { success } = require('../utils/response');

const buildPc = async (req, res, next) => {
  try {
    const { cpu_id, mainboard_id, ram_id, vga_id, psu_id } = req.body;
    const result = await aiService.buildPc({ cpu_id, mainboard_id, ram_id, vga_id, psu_id });
    return success(res, result, 'Kiểm tra build PC hoàn tất');
  } catch (err) { next(err); }
};

const checkCompatibility = async (req, res, next) => {
  try {
    const { cpu_id, mainboard_id, ram_id, vga_id, psu_id } = req.body;
    const result = await aiService.checkCompatibility({ cpu_id, mainboard_id, ram_id, vga_id, psu_id });
    return success(res, result, 'Kiểm tra tương thích hoàn tất');
  } catch (err) { next(err); }
};

const suggestCompatible = async (req, res, next) => {
  try {
    const result = await aiService.suggestCompatible(req.params.productId);
    return success(res, result);
  } catch (err) { next(err); }
};

module.exports = { buildPc, checkCompatibility, suggestCompatible };

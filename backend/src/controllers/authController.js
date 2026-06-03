const authService = require('../services/authService');
const { success, error } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    return success(res, result, 'Đăng nhập thành công');
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, user);
  } catch (err) { next(err); }
};

const logout = async (req, res) => {
  // JWT is stateless; client just discards token
  return success(res, null, 'Đăng xuất thành công');
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return success(res, null, 'Đổi mật khẩu thành công');
  } catch (err) { next(err); }
};

module.exports = { login, getMe, logout, changePassword };

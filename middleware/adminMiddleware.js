const adminMiddleware = (req, res, next) => {
    if (!req.user) {
      req.flash('error', 'Требуется авторизация');
      return res.redirect('/auth/login');
    }
  
    if (req.user.role !== 'admin') {
      req.flash('error', 'Доступ запрещён: требуется роль администратора');
      return res.redirect('/tours');
    }
  
    next();
  };
  
  module.exports = adminMiddleware;
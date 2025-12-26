module.exports = {
    // Yêu cầu phải đăng nhập
    requireLogin: (req, res, next) => {
        if (req.session && req.session.user) {
            next();
        } else {
            res.redirect('/dang-nhap');
        }
    },

    // Yêu cầu phải là Admin
    requireAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.vai_tro === 'admin') {
            next();
        } else {
            res.status(403).send('<h1>Lỗi 403: Bạn không có quyền truy cập trang Admin.</h1><a href="/trang-chu">Về trang chủ</a>');
        }
    },

    // Yêu cầu phải là Nhân viên (Admin cũng vào được)
    requireStaff: (req, res, next) => {
        if (req.session.user && (req.session.user.vai_tro === 'nhan_vien' || req.session.user.vai_tro === 'admin')) {
            next();
        } else {
            res.status(403).send('<h1>Lỗi 403: Bạn không có quyền truy cập trang Nhân viên.</h1><a href="/trang-chu">Về trang chủ</a>');
        }
    }
};
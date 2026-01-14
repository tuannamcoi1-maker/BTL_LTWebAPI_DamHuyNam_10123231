module.exports = {
    requireLogin: (req, res, next) => {
        if (req.session && req.session.user) {
            next();
        } else {
            // Nếu là API hoặc Ajax -> Trả về JSON lỗi
            if (req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục." });
            }
            // Nếu là Web -> Chuyển trang
            res.redirect('/dang-nhap');
        }
    },

    requireAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.vai_tro === 'admin') {
            next();
        } else {
            if (req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({ success: false, message: "Không có quyền Admin." });
            }
            res.status(403).send('<h1>Lỗi 403: Cấm truy cập</h1><a href="/trang-chu">Về trang chủ</a>');
        }
    },

    requireStaff: (req, res, next) => {
        // 1. Kiểm tra xem đã đăng nhập chưa
        if (!req.session || !req.session.user) {
            if (req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(401).json({ success: false, message: "Vui lòng đăng nhập." });
            }
            return res.redirect('/dang-nhap'); // Chưa đăng nhập thì về trang login
        }

        // 2. Nếu đã đăng nhập, kiểm tra quyền
        const role = req.session.user.vai_tro; // Sử dụng vai_tro như trong Controller
        if (role === 'nhan_vien' || role === 'admin') {
            next();
        } else {
            if (req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({ success: false, message: "Không có quyền Nhân viên." });
            }
            res.status(403).send('<h1>Lỗi 403: Bạn không có quyền truy cập trang này</h1><a href="/trang-chu">Về trang chủ</a>');
        }
    }
    
};
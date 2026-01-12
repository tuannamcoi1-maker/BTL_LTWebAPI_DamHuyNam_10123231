// CHÚ Ý: Phải viết hoa chữ U nếu file model của bạn tên là "UserModel.js"
// Nếu file model tên "userModel.js" (chữ thường) thì sửa dòng dưới thành require('../models/userModel')
const UserModel = require('../models/userModel'); 

module.exports = {
    // --- GIAO DIỆN WEB ---
    loginPage: (req, res) => res.render('dang-nhap'),
    registerPage: (req, res) => res.render('dang-ky'),

    // --- API XỬ LÝ ---

    // 1. Đăng ký
    register: (req, res) => {
        UserModel.create(req.body, (err) => {
            if(err) res.json({ success: false, message: "Email có thể đã tồn tại hoặc lỗi DB" });
            else res.json({ success: true, message: "Đăng ký thành công" });
        });
    },

    // 2. Đăng nhập
    login: (req, res) => {
        UserModel.findByEmailAndPassword(req.body.email, req.body.mat_khau, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Lỗi Server" });
            
            if (results && results.length > 0) {
                const user = results[0];
                
                // Lưu session
                req.session.user = user;

                // Xác định hướng điều hướng cho Web
                let redirectUrl = '/trang-chu';
                if (user.vai_tro === 'admin') redirectUrl = '/admin/dashboard';
                else if (user.vai_tro === 'nhan_vien') redirectUrl = '/staff/orders';

                // Trả về JSON cho cả Web (Ajax) và Postman
                res.json({ success: true, user: user, redirectUrl: redirectUrl });
            } else {
                res.json({ success: false, message: "Sai email hoặc mật khẩu" });
            }
        });
    },

    // 3. Đăng xuất (Logic Mới: Phân biệt API và Web)
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.log("Lỗi logout:", err);
                return res.redirect('/trang-chu');
            }
            
            // Xóa cookie session ở client
            res.clearCookie('connect.sid'); 

            // [QUAN TRỌNG] Kiểm tra xem ai đang gọi: API hay Trình duyệt Web?
            // Nếu đường dẫn chứa '/api' HOẶC là request Ajax (xhr) HOẶC Postman yêu cầu JSON
            if (req.originalUrl.startsWith('/api') || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                // -> Trả về JSON (Postman sẽ thấy cái này)
                return res.json({ success: true, message: "Đăng xuất thành công!" });
            }

            // -> Nếu là Web bình thường thì chuyển về trang đăng nhập
            res.redirect('/dang-nhap');
        });
    }
};
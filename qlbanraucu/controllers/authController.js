// CHÚ Ý DÒNG NÀY: Phải viết hoa chữ U nếu file model của bạn tên là "UserModel.js"
const UserModel = require('../models/userModel'); 

module.exports = {
    loginPage: (req, res) => res.render('dang-nhap'),
    registerPage: (req, res) => res.render('dang-ky'),

    // API Đăng ký
    register: (req, res) => {
        UserModel.create(req.body, (err) => {
            if(err) res.json({ success: false, message: "Email có thể đã tồn tại" });
            else res.json({ success: true });
        });
    },

    // API Đăng nhập
    login: (req, res) => {
        UserModel.findByEmailAndPassword(req.body.email, req.body.mat_khau, (err, results) => {
            if (results && results.length > 0) {
                const user = results[0];
                
                // 1. Lưu session (Sẽ hoạt động TỐT nhờ app.js đã cấu hình đúng)
                req.session.user = user;

                // 2. Kiểm tra vai trò để điều hướng
                let redirectUrl = '/trang-chu';
                if (user.vai_tro === 'admin') redirectUrl = '/admin/dashboard';
                else if (user.vai_tro === 'nhan_vien') redirectUrl = '/staff/orders';

                // 3. Trả về client để JS (auth.js) tự chuyển trang
                res.json({ success: true, user: user, redirectUrl: redirectUrl });
            } else {
                res.json({ success: false, message: "Sai email hoặc mật khẩu" });
            }
        });
    },

    // Đăng xuất
    logout: (req, res) => {
        req.session.destroy(); // Xóa session trong bộ nhớ server
        res.redirect('/dang-nhap');
    }
};
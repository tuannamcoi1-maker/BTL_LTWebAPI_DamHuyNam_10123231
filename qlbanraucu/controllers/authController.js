// CHÚ Ý: Phải viết hoa chữ U nếu file model của bạn tên là "UserModel.js"
// Nếu file model tên "userModel.js" (chữ thường) thì sửa dòng dưới thành require('../models/userModel')
const UserModel = require('../models/userModel'); 

module.exports = {
    // --- GIAO DIỆN WEB ---
    loginPage: (req, res) => res.render('dang-nhap'),
    registerPage: (req, res) => res.render('dang-ky'),

    // --- API XỬ LÝ ---
    // 1. Hiển thị trang tài khoản
    profilePage: (req, res) => {
        const userId = req.session.user.ma_nguoi_dung; // Lấy ID từ session
        UserModel.findById(userId, (err, results) => {
            if (err || results.length === 0) return res.redirect('/trang-chu');
            res.render('tai-khoan', { user: results[0] });
        });
    },

    // 2. Xử lý cập nhật thông tin & đổi mật khẩu
    updateProfile: (req, res) => {
        const userId = req.session.user.ma_nguoi_dung;
        const { ho_ten, so_dien_thoai, email, mat_khau_cu, mat_khau_moi } = req.body;

        UserModel.findById(userId, (err, results) => {
            const user = results[0];
            
            // KIỂM TRA MẬT KHẨU CŨ (Nếu người dùng muốn đổi mật khẩu)
            if (mat_khau_moi && mat_khau_cu !== user.mat_khau) {
                return res.json({ success: false, message: "Mật khẩu cũ không chính xác!" });
            }

            // Cập nhật thông tin cơ bản
            UserModel.updateInfo(userId, { ho_ten, so_dien_thoai, email }, (err) => {
                if (err) return res.json({ success: false, message: "Lỗi cập nhật thông tin" });

                // Nếu có mật khẩu mới thì cập nhật luôn
                if (mat_khau_moi) {
                    UserModel.updatePassword(userId, mat_khau_moi, (err) => {
                        if (err) return res.json({ success: false, message: "Lỗi đổi mật khẩu" });
                        updateSessionAndResponse();
                    });
                } else {
                    updateSessionAndResponse();
                }
            });

            function updateSessionAndResponse() {
                // Cập nhật lại session để giao diện đổi tên ngay lập tức
                req.session.user.ho_ten = ho_ten;
                res.json({ success: true, message: "Cập nhật thành công!" });
            }
        });
    },
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
    },
    // 4. Hiển thị trang Lịch sử mua hàng
    orderHistoryPage: (req, res) => {
        const userId = req.session.user.ma_nguoi_dung; // Lấy ID từ session
        UserModel.getOrdersByUserId(userId, (err, orders) => {
            if (err) return res.send("Lỗi lấy lịch sử mua hàng");
            res.render('lich-su-mua-hang', { orders: orders || [] });
        });
    },
    // Thêm hàm hiển thị trang chi tiết đơn hàng
    orderDetailPage: (req, res) => {
        const orderId = req.params.id;
        const userId = req.session.user.ma_nguoi_dung; // Lấy ID user từ session
        
        // Gọi Model đã viết ở Bước 1
        UserModel.getOrderDetailById(orderId, userId, (err, details) => {
            if (err) {
                console.log(err);
                return res.send("Lỗi hệ thống");
            }
            
            // Nếu không tìm thấy chi tiết (hoặc đơn hàng không phải của user này)
            if (!details || details.length === 0) {
                return res.send("Không tìm thấy đơn hàng hoặc bạn không có quyền xem.");
            }

            // Render ra view (sẽ tạo ở Bước 4)
            res.render('chi-tiet-don-hang', { 
                details: details, 
                orderId: orderId 
            });
        });
    }
};
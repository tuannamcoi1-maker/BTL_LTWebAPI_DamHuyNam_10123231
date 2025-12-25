const User = require('../models/userModel');
const bcrypt = require('bcryptjs'); // Dùng để mã hóa mật khẩu

exports.register = (req, res) => {
    const { ho_ten, email, so_dien_thoai, dia_chi, mat_khau } = req.body;

    // 1. Kiểm tra xem email đã tồn tại chưa
    User.findByEmail(email, (err, user) => {
        if (user) {
            return res.json({ success: false, message: "Email đã tồn tại!" });
        }

        // 2. Mã hóa mật khẩu trước khi lưu (Bảo mật)
        // Lưu ý: Nếu muốn đơn giản để test có thể bỏ qua bước hash này, nhưng làm BTL nên có.
        const hashedPassword = bcrypt.hashSync(mat_khau, 10); 

        const newUser = { ho_ten, email, so_dien_thoai, dia_chi, mat_khau: hashedPassword };

        // 3. Lưu vào DB
        User.create(newUser, (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "Lỗi Server" });
            res.json({ success: true, message: "Đăng ký thành công!" });
        });
    });
};

exports.login = (req, res) => {
    const { email, mat_khau } = req.body;

    User.findByEmail(email, (err, user) => {
        if (!user) {
            return res.json({ success: false, message: "Email không tồn tại!" });
        }

        // So sánh mật khẩu (user.mat_khau là hash trong DB)
        // Nếu lúc đăng ký bạn không hash thì dùng: if (mat_khau !== user.mat_khau)
        if (!bcrypt.compareSync(mat_khau, user.mat_khau)) {
            return res.json({ success: false, message: "Sai mật khẩu!" });
        }

        // Đăng nhập thành công -> Trả về thông tin User + Vai trò
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            user: {
                ma_nguoi_dung: user.ma_nguoi_dung,
                ho_ten: user.ho_ten,
                vai_tro: user.vai_tro // Quan trọng: Trả về vai trò để Frontend biết
            }
        });
    });
};
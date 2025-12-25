const db = require('../config/db');

const User = {
    // Tìm user theo email (để check đăng nhập)
    findByEmail: (email, callback) => {
        const sql = "SELECT * FROM nguoi_dung WHERE email = ?";
        db.query(sql, [email], (err, results) => {
            if (err) return callback(err, null);
            return callback(null, results[0]);
        });
    },

    // Tạo user mới (Mặc định vai trò là 'khach_hang')
    create: (userData, callback) => {
        const sql = "INSERT INTO nguoi_dung (ho_ten, email, so_dien_thoai, dia_chi, mat_khau, vai_tro) VALUES (?, ?, ?, ?, ?, ?)";
        // Mặc định vai trò là khách hàng khi đăng ký từ web
        const role = 'khach_hang'; 
        db.query(sql, [userData.ho_ten, userData.email, userData.so_dien_thoai, userData.dia_chi, userData.mat_khau, role], (err, results) => {
            if (err) return callback(err, null);
            return callback(null, results);
        });
    }
};

module.exports = User;
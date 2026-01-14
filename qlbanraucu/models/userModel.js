const db = require('../config/db');

module.exports = {
    // Lấy thông tin mới nhất của user theo ID
    findById: (id, cb) => {
        db.query("SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = ?", [id], cb);
    },

    // Cập nhật thông tin cơ bản (Tên, SĐT, Email)
    updateInfo: (id, data, cb) => {
        const sql = "UPDATE nguoi_dung SET ho_ten = ?, so_dien_thoai = ?, email = ? WHERE ma_nguoi_dung = ?";
        db.query(sql, [data.ho_ten, data.so_dien_thoai, data.email, id], cb);
    },

    // Cập nhật mật khẩu mới
    updatePassword: (id, newPassword, cb) => {
        db.query("UPDATE nguoi_dung SET mat_khau = ? WHERE ma_nguoi_dung = ?", [newPassword, id], cb);
    },
    create: (data, callback) => {
        var sql = "INSERT INTO nguoi_dung (ho_ten, email, mat_khau, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [data.ho_ten, data.email, data.mat_khau, data.so_dien_thoai, data.dia_chi], callback);
    },
    findByEmailAndPassword: (email, mat_khau, callback) => {
        var sql = "SELECT * FROM nguoi_dung WHERE email = ? AND mat_khau = ?";
        db.query(sql, [email, mat_khau], callback);
    },
    getOrdersByUserId: (userId, cb) => {
        const sql = `SELECT * FROM hoa_don 
                     WHERE ma_nguoi_dung = ? 
                     ORDER BY ngay_dat_hang DESC`;
        db.query(sql, [userId], cb);
    },
    // Thêm hàm lấy chi tiết đơn hàng (có kiểm tra quyền sở hữu của user)
    getOrderDetailById: (orderId, userId, cb) => {
        const sql = `
            SELECT ct.*, sp.ten_san_pham, sp.anh_dai_dien 
            FROM chi_tiet_hoa_don ct 
            JOIN san_pham sp ON ct.ma_san_pham = sp.ma_san_pham 
            JOIN hoa_don hd ON ct.ma_hoa_don = hd.ma_hoa_don
            WHERE ct.ma_hoa_don = ? AND hd.ma_nguoi_dung = ?
        `;
        db.query(sql, [orderId, userId], cb);
    }
};
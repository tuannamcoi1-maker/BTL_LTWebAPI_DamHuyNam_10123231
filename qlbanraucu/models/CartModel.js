const db = require('../config/db');

module.exports = {
    // Lấy giỏ hàng
    getCartByUser: (userId, callback) => {
        var sql = `SELECT g.ma_gio_hang, g.so_luong, s.gia_ban, s.ten_san_pham, s.anh_dai_dien, s.ma_san_pham 
                   FROM gio_hang g 
                   JOIN san_pham s ON g.ma_san_pham = s.ma_san_pham 
                   WHERE g.ma_nguoi_dung = ?`;
        db.query(sql, [userId], callback);
    },
    // Thêm vào giỏ (Check tồn tại -> Update hoặc Insert)
    addToCart: (userId, productId, qty, callback) => {
        var checkSql = "SELECT * FROM gio_hang WHERE ma_nguoi_dung = ? AND ma_san_pham = ?";
        db.query(checkSql, [userId, productId], (err, res) => {
            if(err) return callback(err);
            if(res.length > 0) {
                var newQty = res[0].so_luong + qty;
                db.query("UPDATE gio_hang SET so_luong = ? WHERE ma_gio_hang = ?", [newQty, res[0].ma_gio_hang], callback);
            } else {
                db.query("INSERT INTO gio_hang (ma_nguoi_dung, ma_san_pham, so_luong) VALUES (?, ?, ?)", [userId, productId, qty], callback);
            }
        });
    },
    // Xóa item
    removeCartItem: (id, callback) => {
        db.query("DELETE FROM gio_hang WHERE ma_gio_hang = ?", [id], callback);
    },
    // Tạo hóa đơn
    createOrder: (userId, total, address, note, callback) => {
        var sql = "INSERT INTO hoa_don (ma_nguoi_dung, tong_tien, dia_chi_giao_hang, ghi_chu) VALUES (?, ?, ?, ?)";
        db.query(sql, [userId, total, address, note], callback);
    },
    // Lưu chi tiết hóa đơn
    createOrderDetail: (values, callback) => {
        var sql = "INSERT INTO chi_tiet_hoa_don (ma_hoa_don, ma_san_pham, so_luong, don_gia_luc_mua) VALUES ?";
        db.query(sql, [values], callback);
    },
    // Xóa sạch giỏ hàng
    clearCart: (userId, callback) => {
        db.query("DELETE FROM gio_hang WHERE ma_nguoi_dung = ?", [userId], callback);
    }
};
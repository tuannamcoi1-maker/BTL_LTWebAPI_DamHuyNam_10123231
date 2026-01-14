const db = require('../config/db');

module.exports = {
    getCartByUser: (userId, callback) => {
        var sql = `SELECT g.ma_gio_hang, g.so_luong, s.gia_ban, s.ten_san_pham, s.anh_dai_dien, s.ma_san_pham 
                   FROM gio_hang g 
                   JOIN san_pham s ON g.ma_san_pham = s.ma_san_pham 
                   WHERE g.ma_nguoi_dung = ?`;
        db.query(sql, [userId], callback);
    },
    addToCart: (userId, productId, qty, callback) => {
        // Check tồn tại
        var checkSql = "SELECT * FROM gio_hang WHERE ma_nguoi_dung = ? AND ma_san_pham = ?";
        db.query(checkSql, [userId, productId], (err, res) => {
            if(err) return callback(err);
            if(res.length > 0) {
                var newQty = res[0].so_luong + Number(qty);
                db.query("UPDATE gio_hang SET so_luong = ? WHERE ma_gio_hang = ?", [newQty, res[0].ma_gio_hang], callback);
            } else {
                db.query("INSERT INTO gio_hang (ma_nguoi_dung, ma_san_pham, so_luong) VALUES (?, ?, ?)", [userId, productId, qty], callback);
            }
        });
    },
    updateQuantity: (ma_gio_hang, so_luong, callback) => {
        const sql = "UPDATE gio_hang SET so_luong = ? WHERE ma_gio_hang = ?";
        db.query(sql, [so_luong, ma_gio_hang], callback);
    },
    removeCartItem: (id, callback) => {
        db.query("DELETE FROM gio_hang WHERE ma_gio_hang = ?", [id], callback);
    },
    checkPromotion: (code, callback) => {
        // Chỉ chọn mã có trang_thai = 1 (Đang chạy)
        // Không cần check ngày nữa vì hàm update ở Admin đã lo việc đó rồi
        const sql = "SELECT * FROM khuyen_mai WHERE ma_code = ? AND trang_thai = 1";
        db.query(sql, [code], callback);
    },
    
    // [QUAN TRỌNG] Sửa cột dia_chi thành dia_chi_giao_hang
    createOrder: (userId, total, address, note, promotionId, callback) => {
        var sql = "INSERT INTO hoa_don (ma_nguoi_dung, tong_tien, dia_chi_giao_hang, ghi_chu, ma_khuyen_mai, trang_thai) VALUES (?, ?, ?, ?, ?, 'cho_xac_nhan')";
        db.query(sql, [userId, total, address, note, promotionId], callback);
    },
    createOrderDetail: (values, callback) => {
        var sql = "INSERT INTO chi_tiet_hoa_don (ma_hoa_don, ma_san_pham, so_luong, don_gia_luc_mua) VALUES ?";
        db.query(sql, [values], callback);
    },
    clearCart: (userId, callback) => {
        db.query("DELETE FROM gio_hang WHERE ma_nguoi_dung = ?", [userId], callback);
    }
};
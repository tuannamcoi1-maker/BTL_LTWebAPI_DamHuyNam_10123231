const db = require('../config/db');

module.exports = {
    getAllOrders: (cb) => {
        var sql = `SELECT hd.*, nd.ho_ten 
                   FROM hoa_don hd 
                   JOIN nguoi_dung nd ON hd.ma_nguoi_dung = nd.ma_nguoi_dung 
                   ORDER BY hd.ngay_dat_hang DESC`; // Đã sửa thành ngay_dat_hang cho khớp DB
        db.query(sql, cb);
    },
    
    getOrderDetail: (orderId, cb) => {
        var sql = `SELECT ct.*, sp.ten_san_pham, sp.anh_dai_dien 
                   FROM chi_tiet_hoa_don ct 
                   JOIN san_pham sp ON ct.ma_san_pham = sp.ma_san_pham 
                   WHERE ct.ma_hoa_don = ?`;
        db.query(sql, [orderId], cb);
    },

    updateOrderStatus: (orderId, status, cb) => {
        db.query("UPDATE hoa_don SET trang_thai = ? WHERE ma_hoa_don = ?", [status, orderId], cb);
    }
};
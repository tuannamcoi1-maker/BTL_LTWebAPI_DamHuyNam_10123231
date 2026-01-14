const db = require('../config/db');

module.exports = {
    // 1. Chỉ lấy đơn hàng CHƯA thanh toán (Hiện ở Quản lý)
    getPendingOrders: (cb) => {
        var sql = `SELECT hd.*, nd.ho_ten 
                   FROM hoa_don hd 
                   JOIN nguoi_dung nd ON hd.ma_nguoi_dung = nd.ma_nguoi_dung 
                   WHERE hd.trang_thai != 'da_thanh_toan' 
                   ORDER BY hd.ngay_dat_hang DESC`; 
        db.query(sql, cb);
    },

    // 2. Chỉ lấy đơn hàng ĐÃ thanh toán (Hiện ở Lịch sử)
    getPaidOrders: (cb) => {
        var sql = `SELECT hd.*, nd.ho_ten 
                   FROM hoa_don hd 
                   JOIN nguoi_dung nd ON hd.ma_nguoi_dung = nd.ma_nguoi_dung 
                   WHERE hd.trang_thai = 'da_thanh_toan' 
                   ORDER BY hd.ngay_dat_hang DESC`; 
        db.query(sql, cb);
    },
    
    // Giữ nguyên các hàm getOrderDetail và updateOrderStatus bên dưới...
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
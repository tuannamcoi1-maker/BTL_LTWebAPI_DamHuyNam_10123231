const db = require('../config/db');

module.exports = {
    // 1. Chỉ lấy đơn hàng ĐANG CHẠY (Chờ xác nhận, Đã xác nhận)
    // Sửa câu lệnh WHERE: Không lấy 'da_thanh_toan' VÀ không lấy 'da_huy'
    getPendingOrders: (cb) => {
        var sql = `SELECT hd.*, nd.ho_ten 
                   FROM hoa_don hd 
                   JOIN nguoi_dung nd ON hd.ma_nguoi_dung = nd.ma_nguoi_dung 
                   WHERE hd.trang_thai NOT IN ('da_thanh_toan', 'da_huy') 
                   ORDER BY hd.ngay_dat_hang DESC`; 
        db.query(sql, cb);
    },

    // 2. Lấy đơn hàng ĐÃ KẾT THÚC (Đã thanh toán HOẶC Đã hủy)
    // Để nhân viên xem lại lịch sử đơn hủy
    getPaidOrders: (cb) => {
        var sql = `SELECT hd.*, nd.ho_ten 
                   FROM hoa_don hd 
                   JOIN nguoi_dung nd ON hd.ma_nguoi_dung = nd.ma_nguoi_dung 
                   WHERE hd.trang_thai IN ('da_thanh_toan', 'da_huy') 
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

    updateOrderStatus: (id, status, cb) => {
        var sql = "UPDATE hoa_don SET trang_thai = ? WHERE ma_hoa_don = ?";
        db.query(sql, [status, id], cb);
    }
};
const db = require('../config/db');

module.exports = {
    // 1. SẢN PHẨM
    // data body phải có: ma_danh_muc, ten_san_pham, gia_ban, gia_goc, ...
    addProduct: (data, cb) => {
        db.query("INSERT INTO san_pham SET ?", data, cb);
    },
    updateProduct: (id, data, cb) => {
        db.query("UPDATE san_pham SET ? WHERE ma_san_pham = ?", [data, id], cb);
    },
    deleteProduct: (id, cb) => {
        db.query("DELETE FROM san_pham WHERE ma_san_pham = ?", [id], cb);
    },

    // 2. NGƯỜI DÙNG
    getAllUsers: (cb) => {
        db.query("SELECT ma_nguoi_dung, ho_ten, email, so_dien_thoai, vai_tro, trang_thai FROM nguoi_dung", cb);
    },
    deleteUser: (id, cb) => {
        db.query("DELETE FROM nguoi_dung WHERE ma_nguoi_dung = ?", [id], cb);
    },

    // 3. DANH MỤC
    getAllCategories: (cb) => {
        db.query("SELECT * FROM danh_muc", cb);
    },
    addCategory: (data, cb) => {
        db.query("INSERT INTO danh_muc SET ?", data, cb);
    },
    updateCategory: (id, data, cb) => {
        db.query("UPDATE danh_muc SET ? WHERE ma_danh_muc = ?", [data, id], cb);
    },
    deleteCategory: (id, cb) => {
        db.query("DELETE FROM danh_muc WHERE ma_danh_muc = ?", [id], cb);
    },

    // 4. KHUYẾN MÃI
    getAllPromotions: (cb) => {
        db.query("SELECT * FROM khuyen_mai", cb);
    },
    addPromotion: (data, cb) => {
        db.query("INSERT INTO khuyen_mai SET ?", data, cb);
    },
    updatePromotion: (id, data, cb) => {
        db.query("UPDATE khuyen_mai SET ? WHERE ma_khuyen_mai = ?", [data, id], cb);
    },
    deletePromotion: (id, cb) => {
        db.query("DELETE FROM khuyen_mai WHERE ma_khuyen_mai = ?", [id], cb);
    },

    // 5. THỐNG KÊ (Updated for Schema)
    getRevenueStats: (cb) => {
        // Lấy các đơn hàng đã thanh toán (da_thanh_toan)
        const sql = `
            SELECT 
                hd.ma_hoa_don, hd.ngay_dat_hang, hd.tong_tien, hd.trang_thai,
                nd.ho_ten, nd.email,
                sp.ten_san_pham,
                ct.so_luong, ct.don_gia_luc_mua
            FROM hoa_don hd
            JOIN nguoi_dung nd ON hd.ma_nguoi_dung = nd.ma_nguoi_dung
            JOIN chi_tiet_hoa_don ct ON hd.ma_hoa_don = ct.ma_hoa_don
            JOIN san_pham sp ON ct.ma_san_pham = sp.ma_san_pham
            WHERE hd.trang_thai = 'da_thanh_toan'
            ORDER BY hd.ngay_dat_hang DESC
        `;
        db.query(sql, cb);
    },
    // --- THÊM HÀM CẬP NHẬT TRẠNG THÁI TỰ ĐỘNG ---
    updatePromotionStates: (cb) => {
        // Logic SQL:
        // - Nếu hôm nay nhỏ hơn ngày bắt đầu -> Gán 0 (Chưa chạy)
        // - Nếu hôm nay lớn hơn ngày kết thúc -> Gán 2 (Kết thúc)
        // - Còn lại -> Gán 1 (Đang chạy)
        const sql = `
            UPDATE khuyen_mai
            SET trang_thai = CASE
                WHEN CURDATE() < ngay_bat_dau THEN 0
                WHEN CURDATE() > ngay_ket_thuc THEN 2
                ELSE 1
            END
        `;
        db.query(sql, cb);
    }
};
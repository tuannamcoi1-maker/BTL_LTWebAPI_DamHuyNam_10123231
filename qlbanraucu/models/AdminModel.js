const db = require('../config/db');

module.exports = {
    // ===================================================
    // 1. QUẢN LÝ SẢN PHẨM (San Pham)
    // ===================================================
    addProduct: (data, cb) => {
        db.query("INSERT INTO san_pham SET ?", data, cb);
    },
    updateProduct: (id, data, cb) => {
        db.query("UPDATE san_pham SET ? WHERE ma_san_pham = ?", [data, id], cb);
    },
    deleteProduct: (id, cb) => {
        db.query("DELETE FROM san_pham WHERE ma_san_pham = ?", [id], cb);
    },

    // ===================================================
    // 2. QUẢN LÝ NGƯỜI DÙNG (Nguoi Dung)
    // ===================================================
    getAllUsers: (cb) => {
        db.query("SELECT * FROM nguoi_dung", cb);
    },
    // Admin thêm người dùng (nếu cần)
    addUser: (data, cb) => {
        db.query("INSERT INTO nguoi_dung SET ?", data, cb);
    },
    // Sửa thông tin người dùng
    updateUser: (id, data, cb) => {
        db.query("UPDATE nguoi_dung SET ? WHERE ma_nguoi_dung = ?", [data, id], cb);
    },
    deleteUser: (id, cb) => {
        db.query("DELETE FROM nguoi_dung WHERE ma_nguoi_dung = ?", [id], cb);
    },

    // ===================================================
    // 3. QUẢN LÝ DANH MỤC (Danh Muc)
    // ===================================================
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
        // Lưu ý: Thường phải xóa sản phẩm thuộc danh mục trước hoặc set null
        db.query("DELETE FROM danh_muc WHERE ma_danh_muc = ?", [id], cb);
    },

    // ===================================================
    // 4. QUẢN LÝ KHUYẾN MÃI (Khuyen Mai)
    // ===================================================
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
    }
};
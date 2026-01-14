const db = require('../config/db');

module.exports = {
    getAllProducts: (callback) => {
        db.query("SELECT * FROM san_pham", callback);
    },
    getProductsByCategory: (idDanhMuc, callback) => {
        db.query("SELECT * FROM san_pham WHERE ma_danh_muc = ?", [idDanhMuc], callback);
    },
    getProductById: (id, callback) => {
        db.query("SELECT * FROM san_pham WHERE ma_san_pham = ?", [id], callback);
    },
    getRelatedProducts: (id, callback) => {
        db.query("SELECT * FROM san_pham WHERE ma_san_pham != ? LIMIT 4", [id], callback);
    },
    getAllCategories: (callback) => {
        db.query("SELECT * FROM danh_muc", callback);
    },
    searchProducts: (keyword, callback) => {
        // Tìm kiếm theo tên sản phẩm
        const sql = "SELECT * FROM san_pham WHERE ten_san_pham LIKE ?";
        db.query(sql, [`%${keyword}%`], callback);
    }
};
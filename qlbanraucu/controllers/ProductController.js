const ProductModel = require('../models/ProductModel');

module.exports = {
    // [API] Lấy danh sách sản phẩm (có hỗ trợ lọc ?danhmuc=...)
    // Cập nhật lại ProductController.js
    apiGetProducts: (req, res) => {
        const catId = req.query.danhmuc;
        const keyword = req.query.q; // Lấy từ khóa tìm kiếm
        
        const handleResponse = (err, products) => {
            if (err) return res.status(500).json({ success: false, message: "Lỗi DB" });

            const data = products.map(p => ({
                ...p,
                phan_tram_giam: p.khuyen_mai || 0 // Dùng luôn cột khuyến mãi từ DB mới
            }));
            res.json({ success: true, count: data.length, data: data });
        };

        if (keyword) {
            // Nếu có từ khóa -> Gọi hàm search
            ProductModel.searchProducts(keyword, handleResponse);
        } else if (catId) {
            ProductModel.getProductsByCategory(catId, handleResponse);
        } else {
            ProductModel.getAllProducts(handleResponse);
        }
    },

    // [API] Lấy chi tiết 1 sản phẩm
    apiGetDetail: (req, res) => {
        ProductModel.getProductById(req.params.id, (err, result) => {
            if (err || result.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
            }
            res.json({ success: true, data: result[0] });
        });
    },

    // [API] Lấy danh sách danh mục
    apiGetCategories: (req, res) => {
        ProductModel.getAllCategories((err, data) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, data: data });
        });
    }
};
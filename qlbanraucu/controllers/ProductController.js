const ProductModel = require('../models/ProductModel');

module.exports = {
    // [API] Lấy danh sách sản phẩm (có hỗ trợ lọc ?danhmuc=...)
    apiGetProducts: (req, res) => {
        const catId = req.query.danhmuc;
        
        const handleResponse = (err, products) => {
            if (err) return res.status(500).json({ success: false, message: "Lỗi cơ sở dữ liệu" });

            // Logic tính giá khuyến mãi
            const data = products.map(p => {
                let phanTram = 0;
                if(p.gia_goc && p.gia_goc > p.gia_ban) {
                    phanTram = Math.round(((p.gia_goc - p.gia_ban) / p.gia_goc) * 100);
                }
                return { ...p, phan_tram_giam: phanTram };
            });

            res.json({ success: true, count: data.length, data: data });
        };

        if (catId) {
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
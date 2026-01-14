const ProductModel = require('../models/ProductModel');

module.exports = {
    index: (req, res) => {
        var maDanhMuc = req.query.danhmuc;
        var keyword = req.query.q; //Lấy từ khóa tìm kiếm từ URL

        const renderView = (err, products, categories) => {
            if (err) return res.send("Lỗi lấy dữ liệu");

            const productsWithDiscount = (products || []).map(product => {
                // Sử dụng logic khuyến mãi đã có
                let phanTramGiam = 0;
                if (product.gia_goc && product.gia_goc > product.gia_ban) {
                    phanTramGiam = Math.round(((product.gia_goc - product.gia_ban) / product.gia_goc) * 100);
                }
                return { ...product, phan_tram_giam: phanTramGiam, co_khuyen_mai: phanTramGiam > 0 };
            });

            res.render('btlon', { 
                products: productsWithDiscount, 
                categories: categories || [], 
                currentCat: maDanhMuc,
                searchKeyword: keyword // Gửi từ khóa lại giao diện để hiển thị (nếu cần)
            });
        };

        ProductModel.getAllCategories((err, categories) => {
            if (keyword) {
                // [QUAN TRỌNG] Nếu có từ khóa, gọi hàm search trong Model
                ProductModel.searchProducts(keyword, (err, products) => {
                    renderView(err, products, categories);
                });
            } else if (maDanhMuc) {
                ProductModel.getProductsByCategory(maDanhMuc, (err, products) => {
                    renderView(err, products, categories);
                });
            } else {
                ProductModel.getAllProducts((err, products) => {
                    renderView(err, products, categories);
                });
            }
        });
    },

    detail: (req, res) => {
        var id = req.params.id;
        ProductModel.getProductById(id, (err, productResult) => {
            if(err || productResult.length === 0) return res.send("Lỗi hoặc không tìm thấy SP");
            
            // Xử lý hiển thị giá cho trang chi tiết
            let product = productResult[0];
            if(product.gia_goc && product.gia_goc > product.gia_ban) {
                product.phan_tram_giam = Math.round(((product.gia_goc - product.gia_ban) / product.gia_goc) * 100);
            } else {
                product.phan_tram_giam = 0;
            }

            ProductModel.getRelatedProducts(id, (err, relatedResult) => {
                res.render('chi-tiet-san-pham', { product: product, relatedProducts: relatedResult || [] });
            });
        });
    }
};
const ProductModel = require('../models/ProductModel');

module.exports = {
    index: (req, res) => {
        var maDanhMuc = req.query.danhmuc;
        
        // Hàm hỗ trợ xử lý dữ liệu sản phẩm trước khi hiển thị
        const renderView = (err, products, categories) => {
            if (err) {
                console.log(err);
                return res.send("Lỗi lấy dữ liệu sản phẩm");
            }

            // --- TÍNH TOÁN KHUYẾN MÃI ---
            const productsWithDiscount = (products || []).map(product => {
                let phanTramGiam = 0;
                // Kiểm tra: Nếu có giá gốc VÀ giá gốc > giá bán thì mới tính %
                if (product.gia_goc && product.gia_goc > product.gia_ban) {
                    phanTramGiam = Math.round(((product.gia_goc - product.gia_ban) / product.gia_goc) * 100);
                }

                return {
                    ...product,
                    phan_tram_giam: phanTramGiam, // Thêm trường % giảm
                    co_khuyen_mai: phanTramGiam > 0 // Cờ đánh dấu có khuyến mãi hay không
                };
            });
            // ---------------------------

            res.render('btlon', { 
                products: productsWithDiscount, 
                categories: categories || [], 
                currentCat: maDanhMuc 
            });
        };

        // Bắt đầu lấy danh mục trước
        ProductModel.getAllCategories((err, categories) => {
            if (maDanhMuc) {
                // Nếu có chọn danh mục -> Lọc theo danh mục
                ProductModel.getProductsByCategory(maDanhMuc, (err, products) => {
                    renderView(err, products, categories);
                });
            } else {
                // Nếu không -> Lấy tất cả
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
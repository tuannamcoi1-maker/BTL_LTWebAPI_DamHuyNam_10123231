const ProductModel = require('../models/ProductModel');

module.exports = {
    index: (req, res) => {
        var maDanhMuc = req.query.danhmuc;
        
        // Callback hell (lồng nhau) - Cách cơ bản để xử lý bất đồng bộ
        ProductModel.getAllCategories((err, categories) => {
            if (maDanhMuc) {
                ProductModel.getProductsByCategory(maDanhMuc, (err, products) => {
                    res.render('btlon', { products: products || [], categories: categories || [], currentCat: maDanhMuc });
                });
            } else {
                ProductModel.getAllProducts((err, products) => {
                    res.render('btlon', { products: products || [], categories: categories || [], currentCat: null });
                });
            }
        });
    },
    detail: (req, res) => {
        var id = req.params.id;
        ProductModel.getProductById(id, (err, productResult) => {
            if(err || productResult.length === 0) return res.send("Lỗi hoặc không tìm thấy SP");
            
            ProductModel.getRelatedProducts(id, (err, relatedResult) => {
                res.render('chi-tiet-san-pham', { product: productResult[0], relatedProducts: relatedResult || [] });
            });
        });
    }
};
const AdminModel = require('../models/AdminModel');
const ProductModel = require('../models/ProductModel');

module.exports = {
    // 1. Dashboard
    dashboard: (req, res) => {
        ProductModel.getAllProducts((err, products) => {
            AdminModel.getAllUsers((err, users) => {
                AdminModel.getAllCategories((err, categories) => {
                    AdminModel.getAllPromotions((err, promotions) => {
                        res.render('admin/dashboard', { 
                            products: products || [], 
                            users: users || [],
                            categories: categories || [],
                            promotions: promotions || []
                        });
                    });
                });
            });
        });
    }, 

    // 2. SẢN PHẨM
    createProduct: (req, res) => {
        AdminModel.addProduct(req.body, (err) => {
            if(err) console.log(err);
            res.redirect('/admin/dashboard');
        });
    }, 
    deleteProduct: (req, res) => {
        AdminModel.deleteProduct(req.params.id, (err) => {
            res.redirect('/admin/dashboard');
        });
    },

    // 3. NGƯỜI DÙNG
    deleteUser: (req, res) => {
        AdminModel.deleteUser(req.params.id, (err) => {
            res.redirect('/admin/dashboard');
        });
    },

    // 4. DANH MỤC (MỚI)
    createCategory: (req, res) => {
        AdminModel.addCategory(req.body, (err) => {
            res.redirect('/admin/dashboard');
        });
    },
    deleteCategory: (req, res) => {
        AdminModel.deleteCategory(req.params.id, (err) => {
            res.redirect('/admin/dashboard');
        });
    },

    // 5. KHUYẾN MÃI (MỚI)
    createPromotion: (req, res) => {
        AdminModel.addPromotion(req.body, (err) => {
            res.redirect('/admin/dashboard');
        });
    },
    deletePromotion: (req, res) => {
        AdminModel.deletePromotion(req.params.id, (err) => {
            res.redirect('/admin/dashboard');
        });
    }
};
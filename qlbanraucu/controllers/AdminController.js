const AdminModel = require('../models/AdminModel');
const ProductModel = require('../models/ProductModel');

// Hàm hỗ trợ format thống kê
function processRevenueStats(rawStats) {
    const ordersMap = {};
    let totalRevenue = 0;

    if (rawStats) {
        rawStats.forEach(row => {
            if (!ordersMap[row.ma_hoa_don]) {
                ordersMap[row.ma_hoa_don] = {
                    ma_hoa_don: row.ma_hoa_don,
                    ngay_dat: row.ngay_dat_hang,
                    khach_hang: row.ho_ten,
                    email: row.email,
                    tong_tien: row.tong_tien,
                    trang_thai: row.trang_thai,
                    san_pham: []
                };
                totalRevenue += Number(row.tong_tien);
            }
            ordersMap[row.ma_hoa_don].san_pham.push({
                ten_san_pham: row.ten_san_pham,
                so_luong: row.so_luong,
                don_gia: row.don_gia_luc_mua
            });
        });
    }
    return {
        orders: Object.values(ordersMap),
        totalRevenue: totalRevenue
    };
}

module.exports = {
    // --- DASHBOARD (WEB) ---
    dashboard: (req, res) => {
        ProductModel.getAllProducts((err, products) => {
            AdminModel.getAllUsers((err, users) => {
                AdminModel.getAllCategories((err, categories) => {
                    AdminModel.getAllPromotions((err, promotions) => {
                        AdminModel.getRevenueStats((err, rawStats) => {
                            const processedData = processRevenueStats(rawStats);
                            res.render('admin/dashboard', { 
                                products: products || [], 
                                users: users || [],
                                categories: categories || [],
                                promotions: promotions || [],
                                stats: processedData.orders,
                                revenue: processedData.totalRevenue
                            });
                        });
                    });
                });
            });
        });
    }, 

    // ================================================================
    // API DATA (JSON cho Postman)
    // ================================================================
    
    // 1. GET ALL LISTS
    apiGetAllProducts: (req, res) => {
        ProductModel.getAllProducts((err, data) => res.json({ success: !err, data: data || [] }));
    },
    apiGetAllUsers: (req, res) => {
        AdminModel.getAllUsers((err, data) => res.json({ success: !err, data: data || [] }));
    },
    apiGetAllCategories: (req, res) => {
        AdminModel.getAllCategories((err, data) => res.json({ success: !err, data: data || [] }));
    },
    apiGetAllPromotions: (req, res) => {
        AdminModel.getAllPromotions((err, data) => res.json({ success: !err, data: data || [] }));
    },
    
    // 2. REVENUE STATS
    apiGetRevenueStats: (req, res) => {
        AdminModel.getRevenueStats((err, rawStats) => {
            if (err) return res.status(500).json({ success: false, message: "Lỗi DB: " + err.message });
            const processedData = processRevenueStats(rawStats);
            res.json({
                success: true,
                totalRevenue: processedData.totalRevenue,
                count: processedData.orders.length,
                orders: processedData.orders
            });
        });
    },

    // ================================================================
    // CRUD XỬ LÝ (Dùng chung logic, check request type để trả về)
    // ================================================================
    
    // --- SẢN PHẨM ---
    createProduct: (req, res) => {
        AdminModel.addProduct(req.body, (err) => {
            if(req.originalUrl.includes('/api')) { // Check nếu gọi từ API
                return res.json({ success: !err, message: err ? err.sqlMessage : "Thêm sản phẩm thành công" });
            }
            res.redirect('/admin/dashboard');
        });
    }, 
    // [THÊM] API Update Product
    updateProduct: (req, res) => {
        AdminModel.updateProduct(req.params.id, req.body, (err) => {
             return res.json({ success: !err, message: err ? err.sqlMessage : "Cập nhật sản phẩm thành công" });
        });
    },
    deleteProduct: (req, res) => {
        AdminModel.deleteProduct(req.params.id, (err) => {
            if(req.originalUrl.includes('/api')) {
                return res.json({ success: !err, message: "Đã xóa sản phẩm" });
            }
            res.redirect('/admin/dashboard');
        });
    },

    // --- DANH MỤC ---
    createCategory: (req, res) => {
        AdminModel.addCategory(req.body, (err) => {
            if(req.originalUrl.includes('/api')) return res.json({ success: !err, message: "Thêm danh mục thành công" });
            res.redirect('/admin/dashboard');
        });
    },
    updateCategory: (req, res) => {
        AdminModel.updateCategory(req.params.id, req.body, (err) => {
            if(req.originalUrl.includes('/api')) return res.json({ success: !err, message: "Cập nhật danh mục thành công" });
            res.redirect('/admin/dashboard');
        });
    },
    deleteCategory: (req, res) => {
        AdminModel.deleteCategory(req.params.id, (err) => {
            if(req.originalUrl.includes('/api')) return res.json({ success: !err, message: "Đã xóa danh mục" });
            res.redirect('/admin/dashboard');
        });
    },

    // --- NGƯỜI DÙNG ---
    deleteUser: (req, res) => {
        AdminModel.deleteUser(req.params.id, (err) => {
            if(req.originalUrl.includes('/api')) return res.json({ success: !err, message: "Đã xóa người dùng" });
            res.redirect('/admin/dashboard');
        });
    },

    // --- KHUYẾN MÃI ---
    createPromotion: (req, res) => {
        AdminModel.addPromotion(req.body, (err) => {
            if(req.originalUrl.includes('/api')) return res.json({ success: !err, message: "Thêm khuyến mãi thành công" });
            res.redirect('/admin/dashboard');
        });
    },
    updatePromotion: (req, res) => {
        AdminModel.updatePromotion(req.params.id, req.body, (err) => {
            if(req.originalUrl.includes('/api')) return res.json({ success: !err, message: "Cập nhật khuyến mãi thành công" });
            res.redirect('/admin/dashboard');
        });
    },
    deletePromotion: (req, res) => {
        AdminModel.deletePromotion(req.params.id, (err) => {
            if(req.originalUrl.includes('/api')) return res.json({ success: !err, message: "Đã xóa khuyến mãi" });
            res.redirect('/admin/dashboard');
        });
    }
};
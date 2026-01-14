const AdminModel = require('../models/AdminModel');
const ProductModel = require('../models/ProductModel');

// --- HÀM HỖ TRỢ XỬ LÝ LỖI XÓA (ĐÃ NÂNG CẤP) ---
function handleDeleteResponse(req, res, err, redirectUrl, successMsg, errorMsgConstraint) {
    const isApi = req.originalUrl.startsWith('/api') || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1);

    if (err) {
        let finalMsg = "Lỗi hệ thống: " + err.message;
        
        // Mã lỗi 1451: Ràng buộc khóa ngoại
        if (err.errno === 1451) {
            finalMsg = errorMsgConstraint || "Dữ liệu đang được sử dụng, không thể xóa!";
        }

        if (isApi) {
            return res.status(400).json({ success: false, message: finalMsg });
        } else {
            // [THAY ĐỔI QUAN TRỌNG] Redirect về trang cũ kèm thông báo lỗi trên URL
            // encodeURIComponent giúp mã hóa tiếng Việt để không bị lỗi trên URL
            return res.redirect(`${redirectUrl}?status=error&message=${encodeURIComponent(finalMsg)}`);
        }
    }

    // Nếu thành công
    if (isApi) {
        return res.json({ success: true, message: successMsg });
    } else {
        // Redirect kèm thông báo thành công
        return res.redirect(`${redirectUrl}?status=success&message=${encodeURIComponent(successMsg)}`);
    }
}

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
        // B1: Cập nhật trạng thái
        AdminModel.updatePromotionStates((err) => {
            if(err) console.log("Lỗi update trạng thái:", err);

            // B2: Lấy sản phẩm (Biến 'products' được tạo ra ở đây)
            ProductModel.getAllProducts((err, products) => { 
                
                // B3: Lấy người dùng
                AdminModel.getAllUsers((err, users) => {
                    
                    // B4: Lấy danh mục
                    AdminModel.getAllCategories((err, categories) => {
                        
                        // B5: Lấy khuyến mãi
                        AdminModel.getAllPromotions((err, promotions) => {
                            
                            // B6: Lấy thống kê
                            AdminModel.getRevenueStats((err, rawStats) => {
                                const processedData = processRevenueStats(rawStats);
                                
                                // Debug: In ra xem có sản phẩm không
                                console.log("Số lượng sản phẩm lấy được:", products ? products.length : 0);

                                // B7: Render giao diện (Tất cả biến phải nằm trong hàm này)
                                res.render('admin/dashboard', { 
                                    products: products || [],     // <-- Biến này lấy từ B2
                                    users: users || [],
                                    categories: categories || [],
                                    promotions: promotions || [],
                                    stats: processedData.orders,
                                    revenue: processedData.totalRevenue
                                });

                            }); // Kết thúc B6
                        }); // Kết thúc B5
                    }); // Kết thúc B4
                }); // Kết thúc B3
            }); // Kết thúc B2 (QUAN TRỌNG: Dấu ngoặc này phải bao trùm tất cả các hàm bên trong)
        
        }); // Kết thúc B1
    },

    // ================================================================
    // API DATA (JSON cho Postman)
    // ================================================================
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
    // CRUD XỬ LÝ (SỬ DỤNG HÀM XỬ LÝ LỖI CHUNG)
    // ================================================================
    
    // --- 1. SẢN PHẨM ---
    createProduct: (req, res) => {
        AdminModel.addProduct(req.body, (err) => {
            if(req.originalUrl.includes('/api')) { 
                return res.json({ success: !err, message: err ? err.sqlMessage : "Thêm sản phẩm thành công" });
            }
            res.redirect('/admin/dashboard');
        });
    }, 
    updateProduct: (req, res) => {
        AdminModel.updateProduct(req.params.id, req.body, (err) => {
             return res.json({ success: !err, message: err ? err.sqlMessage : "Cập nhật sản phẩm thành công" });
        });
    },
    deleteProduct: (req, res) => {
        AdminModel.deleteProduct(req.params.id, (err) => {
            handleDeleteResponse(
                req, res, err, 
                '/admin/dashboard', 
                "Đã xóa sản phẩm", 
                "Không thể xóa: Sản phẩm này đã có trong Đơn hàng hoặc Giỏ hàng!"
            );
        });
    },

    // --- 2. DANH MỤC ---
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
            handleDeleteResponse(
                req, res, err, 
                '/admin/dashboard', 
                "Đã xóa danh mục", 
                "Không thể xóa: Danh mục này đang chứa Sản phẩm. Hãy xóa SP trước!"
            );
        });
    },

    // --- 3. NGƯỜI DÙNG ---
    deleteUser: (req, res) => {
        AdminModel.deleteUser(req.params.id, (err) => {
            handleDeleteResponse(
                req, res, err, 
                '/admin/dashboard', 
                "Đã xóa người dùng", 
                "Không thể xóa: Người dùng này đã có lịch sử Đơn hàng. Chỉ nên khóa tài khoản!"
            );
        });
    },

    // --- 4. KHUYẾN MÃI ---
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
            handleDeleteResponse(
                req, res, err, 
                '/admin/dashboard', 
                "Đã xóa khuyến mãi", 
                "Không thể xóa: Mã này đã được sử dụng trong các Đơn hàng cũ!"
            );
        });
    }
};
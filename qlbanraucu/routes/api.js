var express = require('express');
var router = express.Router();

// --- IMPORT CÁC CONTROLLER ---
var AuthController = require('../controllers/authController');
var CartController = require('../controllers/CartController');
var AdminController = require('../controllers/AdminController');
var StaffController = require('../controllers/StaffController');
var ProductController = require('../controllers/ProductController');
var auth = require('../middleware/authMiddleware');

// ============================================
// 1. PUBLIC & AUTH
// ============================================
// Xem sản phẩm & danh mục
router.get('/products', ProductController.apiGetProducts); 
router.get('/products/:id', ProductController.apiGetDetail); 
router.get('/categories', ProductController.apiGetCategories); 

// Đăng ký, Đăng nhập
router.post('/register', AuthController.register); 
router.post('/login', AuthController.login); 
router.get('/logout', AuthController.logout); 
// API Cập nhật thông tin cá nhân (Profile)
router.post('/user/update', auth.requireLogin, AuthController.updateProfile);
// ============================================
// 2. USER - GIỎ HÀNG 
// ============================================
router.get('/cart', auth.requireLogin, CartController.getCart); 
router.post('/cart/add', auth.requireLogin, CartController.add); 
router.put('/cart/update', auth.requireLogin, CartController.update);
router.delete('/cart/remove/:id', auth.requireLogin, CartController.remove); 

// Check mã giảm giá
router.post('/cart/apply-coupon', auth.requireLogin, CartController.applyCoupon);
// Thanh toán
router.post('/cart/checkout', auth.requireLogin, CartController.checkout);
// Lấy lịch sử đơn hàng của người dùng
router.get('/user/orders', auth.requireLogin, AuthController.apiGetOrderHistory);
// ============================================
// 3. ADMIN API (Quản trị viên)
// ============================================

// --- A. Quản lý SẢN PHẨM ---
router.get('/admin/products', auth.requireAdmin, AdminController.apiGetAllProducts); 
router.post('/admin/products', auth.requireAdmin, AdminController.createProduct); 
router.put('/admin/products/:id', auth.requireAdmin, AdminController.updateProduct); // [Mới] Update SP
router.delete('/admin/products/:id', auth.requireAdmin, AdminController.deleteProduct); 

// --- B. Quản lý NGƯỜI DÙNG ---
router.get('/admin/users', auth.requireAdmin, AdminController.apiGetAllUsers); 
router.delete('/admin/users/:id', auth.requireAdmin, AdminController.deleteUser); 
// (Thường admin không sửa info user qua API này mà user tự sửa, nhưng nếu cần có thể thêm PUT)

// --- C. Quản lý DANH MỤC ---
router.get('/admin/categories', auth.requireAdmin, AdminController.apiGetAllCategories); 
router.post('/admin/categories', auth.requireAdmin, AdminController.createCategory); 
router.put('/admin/categories/:id', auth.requireAdmin, AdminController.updateCategory); 
router.delete('/admin/categories/:id', auth.requireAdmin, AdminController.deleteCategory); 

// --- D. Quản lý KHUYẾN MÃI ---
router.get('/admin/promotions', auth.requireAdmin, AdminController.apiGetAllPromotions); 
router.post('/admin/promotions', auth.requireAdmin, AdminController.createPromotion); 
router.put('/admin/promotions/:id', auth.requireAdmin, AdminController.updatePromotion); 
router.delete('/admin/promotions/:id', auth.requireAdmin, AdminController.deletePromotion); 

// --- E. THỐNG KÊ DOANH THU ---
router.get('/admin/revenue', auth.requireAdmin, AdminController.apiGetRevenueStats);

// ============================================
// 4. STAFF API (Nhân viên)
// ============================================
router.get('/staff/orders', auth.requireStaff, StaffController.apiGetOrders); 
router.get('/staff/orders/:id', auth.requireStaff, StaffController.viewOrderDetail); 
// Xác nhận / Hủy / Thanh toán đơn
router.post('/staff/orders/update/:id', auth.requireStaff, StaffController.confirmOrder); 
// API Lấy danh sách lịch sử đơn hàng (Đã thanh toán)
router.get('/staff/history', auth.requireStaff, StaffController.listHistory);
module.exports = router;
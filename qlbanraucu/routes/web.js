var express = require('express');
var router = express.Router();

// Import Controllers
var HomeController = require('../controllers/HomeController');
var AuthController = require('../controllers/AuthController');
var CartController = require('../controllers/CartController');
var AdminController = require('../controllers/AdminController');
var StaffController = require('../controllers/StaffController');
var auth = require('../middleware/authMiddleware'); // Import Middleware

// --- ĐỊNH NGHĨA ROUTE ---

// 1. PUBLIC ROUTES (Trang chủ & Sản phẩm - Ai cũng vào được)
router.get('/', HomeController.index);
router.get('/trang-chu', HomeController.index);
router.get('/chi-tiet-san-pham/:id', HomeController.detail);

// 2. AUTH (Đăng ký/Đăng nhập)
router.get('/dang-nhap', AuthController.loginPage);
router.get('/dang-ky', AuthController.registerPage);
router.post('/api/dang-ky', AuthController.register);
router.post('/api/dang-nhap', AuthController.login);
router.get('/dang-xuat', AuthController.logout);

// 3. KHÁCH HÀNG (Cần đăng nhập mới mua được hàng)
router.get('/gio-hang', auth.requireLogin, CartController.cartPage);
router.get('/api/gio-hang/:userId', auth.requireLogin, CartController.getCart);
router.post('/api/gio-hang/them', auth.requireLogin, CartController.add);
router.delete('/api/gio-hang/xoa/:id', auth.requireLogin, CartController.remove);
router.post('/api/thanh-toan', auth.requireLogin, CartController.checkout);

// --- 4. ROUTE ADMIN (Chỉ Admin mới được vào) ---
router.get('/admin/dashboard', auth.requireAdmin, AdminController.dashboard);

// Quản lý Sản phẩm
router.post('/admin/san-pham/them', auth.requireAdmin, AdminController.createProduct);
router.get('/admin/san-pham/xoa/:id', auth.requireAdmin, AdminController.deleteProduct); // Mới thêm: Xóa SP

// Quản lý Người dùng
router.get('/admin/nguoi-dung/xoa/:id', auth.requireAdmin, AdminController.deleteUser);

// Quản lý Danh mục (Mới thêm)
router.post('/admin/danh-muc/them', auth.requireAdmin, AdminController.createCategory);
router.get('/admin/danh-muc/xoa/:id', auth.requireAdmin, AdminController.deleteCategory);

// Quản lý Khuyến mãi (Mới thêm)
router.post('/admin/khuyen-mai/them', auth.requireAdmin, AdminController.createPromotion);
router.get('/admin/khuyen-mai/xoa/:id', auth.requireAdmin, AdminController.deletePromotion);

// --- 5. ROUTE NHÂN VIÊN (Nhân viên & Admin đều vào được) ---
router.get('/staff/orders', auth.requireStaff, StaffController.listOrders);
router.get('/staff/orders/detail/:id', auth.requireStaff, StaffController.viewOrderDetail); // Mới thêm: Xem chi tiết đơn
router.post('/staff/orders/update/:id', auth.requireStaff, StaffController.confirmOrder);

module.exports = router;
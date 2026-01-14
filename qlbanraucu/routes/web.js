var express = require('express');
var router = express.Router();

// --- IMPORT CÁC CONTROLLER ---
var HomeController = require('../controllers/HomeController');
var AuthController = require('../controllers/authController');
var CartController = require('../controllers/CartController');
var AdminController = require('../controllers/AdminController');
var StaffController = require('../controllers/StaffController');
var auth = require('../middleware/authMiddleware');

// =========================================================
// PHẦN 1: GIAO DIỆN WEBSITE (Trả về HTML)
// =========================================================

// Giao diện Khách hàng
router.get('/', HomeController.index);
router.get('/trang-chu', HomeController.index);
router.get('/chi-tiet-san-pham/:id', HomeController.detail);

// Auth
router.get('/dang-nhap',  AuthController.loginPage);
router.post('/dang-nhap',  AuthController.login);
router.get('/dang-ky',  AuthController.registerPage);
router.get('/dang-xuat', AuthController.logout);
// tài khoản
router.get('/tai-khoan', auth.requireLogin, AuthController.profilePage); // Xem trang
router.post('/api/user/update', auth.requireLogin, AuthController.updateProfile); // Gửi data
// [QUAN TRỌNG] Route hiển thị khung trang giỏ hàng
router.get('/gio-hang', auth.requireLogin, CartController.cartPage);
// Lịch sử mua hàng
router.get('/lich-su-mua-hang', auth.requireLogin, AuthController.orderHistoryPage);
// [MỚI] Thêm dòng này để xem chi tiết đơn hàng
router.get('/chi-tiet-don-hang/:id', auth.requireLogin, AuthController.orderDetailPage);
// Giao diện Admin & Staff
router.get('/admin/dashboard', auth.requireAdmin, AdminController.dashboard);
router.get('/staff/orders', auth.requireStaff, StaffController.listOrders);
// MỞ TRANG LỊCH SỬ
router.get('/staff/history', auth.requireStaff, StaffController.listHistory);
// 1. API Xem chi tiết đơn hàng (Trả về JSON cho Popup Modal)
router.get('/staff/orders/detail/:id', auth.requireStaff, StaffController.viewOrderDetail);
// 2. API Cập nhật trạng thái đơn (Xác nhận / Hủy / Thanh toán)
router.post('/staff/orders/update/:id', auth.requireStaff, StaffController.confirmOrder);

// =========================================================
// PHẦN 2: API DỮ LIỆU (Trả về JSON - Web gọi cái này để lấy Data)
// =========================================================
// Bạn đang thiếu đoạn này nên web không lấy được dữ liệu!

// Lấy danh sách sản phẩm trong giỏ (Không cần :userId nữa)
router.get('/api/cart', auth.requireLogin, CartController.getCart); 

// Các thao tác thêm/sửa/xóa
router.post('/api/cart/add', auth.requireLogin, CartController.add);
router.post('/api/cart/update', auth.requireLogin, CartController.update);
router.delete('/api/cart/remove/:id', auth.requireLogin, CartController.remove);

// Thanh toán & Mã giảm giá
router.post('/api/cart/apply-coupon', auth.requireLogin, CartController.applyCoupon);
router.post('/api/cart/checkout', auth.requireLogin, CartController.checkout);

// API Admin 
router.post('/admin/san-pham/them', auth.requireAdmin, AdminController.createProduct);
router.get('/admin/san-pham/xoa/:id', auth.requireAdmin, AdminController.deleteProduct);
router.get('/admin/nguoi-dung/xoa/:id', auth.requireAdmin, AdminController.deleteUser);
router.post('/admin/danh-muc/them', auth.requireAdmin, AdminController.createCategory);
router.get('/admin/danh-muc/xoa/:id', auth.requireAdmin, AdminController.deleteCategory);
router.post('/admin/khuyen-mai/them', auth.requireAdmin, AdminController.createPromotion);
router.get('/admin/khuyen-mai/xoa/:id', auth.requireAdmin, AdminController.deletePromotion);

module.exports = router;
const StaffModel = require('../models/StaffModel');

module.exports = {
    // Hiển thị trang Quản lý đơn hàng (Chỉ đơn chưa thanh toán)
    listOrders: (req, res) => {
        StaffModel.getPendingOrders((err, orders) => {
            res.render('staff/quan-ly-don-hang', { orders: orders || [] });
        });
    },

    // THÊM MỚI: Hiển thị trang Lịch sử giao dịch (Chỉ đơn đã thanh toán)
    listHistory: (req, res) => {
        StaffModel.getPaidOrders((err, orders) => {
            res.render('staff/lich-su-giao-dich', { orders: orders || [] });
        });
    },

    // API: Lấy danh sách đơn hàng (JSON)
    apiGetOrders: (req, res) => {
        StaffModel.getAllOrders((err, orders) => {
            res.json({ success: !err, data: orders || [] });
        });
    },

    // API: Xem chi tiết đơn (Đã chuẩn JSON từ trước)
    viewOrderDetail: (req, res) => {
        StaffModel.getOrderDetail(req.params.id, (err, details) => {
            res.json(details || []);
        });
    },

    // API: Xác nhận/Cập nhật đơn hàng
    confirmOrder: (req, res) => {
        const orderId = req.params.id;
        const action = req.body.action; 
        
        let status = 'cho_xac_nhan'; // Mặc định
        
        if(action === 'xac_nhan') status = 'da_xac_nhan';
        if(action === 'thanh_toan') status = 'da_thanh_toan';
        
        // [QUAN TRỌNG] Thêm dòng này để xử lý hủy
        if(action === 'huy') status = 'da_huy'; 

        // Gọi Model cập nhật
        StaffModel.updateOrderStatus(orderId, status, (err) => {
            if(err) return res.json({ success: false, message: "Lỗi DB" });
            res.json({ success: true });
        });
    }
};
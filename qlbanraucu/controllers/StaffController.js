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
        
        // [SỬA LẠI] Đảm bảo các trạng thái gán vào biến status là chữ thường (lowercase)
        // để khớp với hiển thị ở frontend
        let status = 'cho_xac_nhan';
        
        if(action === 'xac_nhan') status = 'da_xac_nhan';     // Sửa Da_ -> da_
        if(action === 'thanh_toan') status = 'da_thanh_toan'; // Sửa Da_ -> da_
        if(action === 'huy') status = 'huy';                  // Sửa Huy -> huy

        StaffModel.updateOrderStatus(orderId, status, (err) => {
            // Trả về JSON để fetch bên client nhận được
            if (err) {
                console.log(err);
                return res.json({ success: false });
            }
            res.json({ success: true });
        });
    }
};
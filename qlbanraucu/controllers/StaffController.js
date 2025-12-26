const StaffModel = require('../models/StaffModel');

module.exports = {
    // Trang quản lý đơn hàng
    listOrders: (req, res) => {
        StaffModel.getAllOrders((err, orders) => {
            res.render('staff/quan-ly-don-hang', { orders: orders });
        });
    },

    // Xem chi tiết đơn
    viewOrderDetail: (req, res) => {
        StaffModel.getOrderDetail(req.params.id, (err, details) => {
            res.json(details); // Trả về JSON để hiện popup hoặc render trang con
        });
    },

    // Xác nhận đơn hàng / Thanh toán
    confirmOrder: (req, res) => {
        const orderId = req.params.id;
        const action = req.body.action; // 'xac_nhan' hoặc 'thanh_toan' hoặc 'huy'
        
        let status = 'Cho_xac_nhan';
        if(action === 'xac_nhan') status = 'Da_xac_nhan';
        if(action === 'thanh_toan') status = 'Da_thanh_toan';
        if(action === 'huy') status = 'Huy';

        StaffModel.updateOrderStatus(orderId, status, (err) => {
            if(err) res.json({success: false});
            else res.json({success: true});
        });
    }
};
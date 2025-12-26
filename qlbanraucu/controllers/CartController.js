const CartModel = require('../models/CartModel');

module.exports = {
    cartPage: (req, res) => res.render('gio-hang'),

    // API: Lấy giỏ hàng
    getCart: (req, res) => {
        CartModel.getCartByUser(req.params.userId, (err, data) => {
            res.json(err ? [] : data);
        });
    },
    // API: Thêm vào giỏ
    add: (req, res) => {
        var { ma_nguoi_dung, ma_san_pham, so_luong } = req.body;
        CartModel.addToCart(ma_nguoi_dung, ma_san_pham, so_luong, (err) => {
            res.json({ success: !err });
        });
    },
    // API: Xóa item
    remove: (req, res) => {
        CartModel.removeCartItem(req.params.id, (err) => res.json({ success: !err }));
    },
    // API: Thanh toán (Logic phức tạp nhất)
    checkout: (req, res) => {
        var { ma_nguoi_dung, tong_tien, dia_chi, ghi_chu } = req.body;
        
        // 1. Lấy giỏ hàng hiện tại để biết mua cái gì
        CartModel.getCartByUser(ma_nguoi_dung, (err, cartItems) => {
            if(cartItems.length === 0) return res.json({ success: false, message: "Giỏ trống" });

            // 2. Tạo hóa đơn
            CartModel.createOrder(ma_nguoi_dung, tong_tien, dia_chi, ghi_chu, (err, result) => {
                if(err) return res.json({ success: false });
                var orderId = result.insertId;

                // 3. Chuẩn bị dữ liệu chi tiết
                var details = cartItems.map(item => [orderId, item.ma_san_pham, item.so_luong, item.gia_ban]);
                
                // 4. Lưu chi tiết hóa đơn
                CartModel.createOrderDetail(details, (err) => {
                    if(err) return res.json({ success: false });
                    
                    // 5. Xóa giỏ hàng
                    CartModel.clearCart(ma_nguoi_dung, () => {
                        res.json({ success: true, ma_hoa_don: orderId });
                    });
                });
            });
        });
    }
};
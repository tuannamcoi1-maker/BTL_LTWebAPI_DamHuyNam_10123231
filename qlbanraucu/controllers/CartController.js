const CartModel = require('../models/CartModel');

// --- HÀM HỖ TRỢ LẤY ID NGƯỜI DÙNG ---
function getUserId(req) {
    // 1. Ưu tiên lấy từ Token (Dành cho Postman/API)
    // Lưu ý: req.user có được nhờ middleware auth.requireLogin
    if (req.user && req.user.id) return req.user.id;
    if (req.user && req.user.ma_nguoi_dung) return req.user.ma_nguoi_dung;

    // 2. Lấy từ Session (Dành cho Website chạy truyền thống)
    if (req.session && req.session.user && req.session.user.id) return req.session.user.id;
    if (req.session && req.session.user && req.session.user.ma_nguoi_dung) return req.session.user.ma_nguoi_dung;

    // 3. (Fallback) Lấy từ Body
    if (req.body.ma_nguoi_dung) return req.body.ma_nguoi_dung;

    return null;
}

module.exports = {
    // 1. Render trang
    cartPage: (req, res) => res.render('gio-hang'),

    // 2. Lấy danh sách giỏ hàng (ĐÃ SỬA: Tự động lấy theo Token)
    getCart: (req, res) => { 
        // B1: Lấy ID từ Token/Session
        let userId = getUserId(req);

        // B2: (Tùy chọn) Nếu Token không có, thử tìm trên URL (Dành cho Admin debug: /cart?uid=1)
        // Nhưng logic chính bây giờ là dùng Token
        if (!userId && req.query.uid) {
             userId = req.query.uid;
        }

        // B3: Kiểm tra
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem giỏ hàng." 
            });
        }

        // B4: Gọi Model
        console.log("Đang lấy giỏ hàng cho User ID:", userId);
        CartModel.getCartByUser(userId, (err, data) => {
            res.json(err ? [] : data);
        }); 
    },

    // 3. Thêm vào giỏ hàng (BẮT BUỘC ĐĂNG NHẬP)
    add: (req, res) => {
        const ma_nguoi_dung = getUserId(req);
        const { ma_san_pham, so_luong } = req.body;

        if (!ma_nguoi_dung) {
            return res.status(401).json({ success: false, message: "Bạn bắt buộc phải đăng nhập!" });
        }

        CartModel.addToCart(ma_nguoi_dung, ma_san_pham, so_luong, (err) => {
            if (err) {
                console.log("Lỗi SQL:", err);
                return res.json({ success: false, message: "Lỗi hệ thống" });
            }
            res.json({ success: true, message: "Đã thêm vào giỏ!" });
        });
    },

    // 4. Cập nhật số lượng
    update: (req, res) => {
        const { ma_gio_hang, so_luong } = req.body;
        if (!ma_gio_hang || so_luong < 1) return res.json({ success: false });
        CartModel.updateQuantity(ma_gio_hang, so_luong, (err) => res.json({ success: !err }));
    },

    // 5. Xóa sản phẩm
    remove: (req, res) => { 
        CartModel.removeCartItem(req.params.id, (err) => res.json({ success: !err })); 
    },

    // 6. Áp dụng mã giảm giá
    applyCoupon: (req, res) => {
        const { code, totalAmount } = req.body;
        CartModel.checkPromotion(code, (err, result) => {
            if (err) return res.json({ success: false, message: "Lỗi Server" });
            if (result.length === 0) return res.json({ success: false, message: "Mã giảm giá sai hoặc hết hạn!" });

            const promo = result[0];
            let discount = 0;

            // --- LOGIC MỚI: TÍNH TOÁN MỨC GIẢM TỐI ĐA ---
            
            // Trường hợp 1: Có giảm theo Phần trăm (%)
            if (promo.phan_tram_giam > 0) {
                // B1: Tính số tiền giảm theo %
                discount = totalAmount * (promo.phan_tram_giam / 100);

                // B2: Kiểm tra mức trần (Giới hạn tối đa)
                // Nếu cột 'so_tien_giam' có giá trị > 0, ta coi đó là mức giảm tối đa
                if (promo.so_tien_giam > 0 && discount > promo.so_tien_giam) {
                    discount = promo.so_tien_giam;
                }
            } 
            // Trường hợp 2: Chỉ giảm tiền cố định (Không có %)
            else if (promo.so_tien_giam > 0) {
                discount = promo.so_tien_giam;
            }

            // Đảm bảo số tiền giảm không vượt quá tổng giá trị đơn hàng
            if(discount > totalAmount) discount = totalAmount;

            // Làm tròn số tiền giảm cho đẹp
            discount = Math.round(discount);

            res.json({ success: true, discount, promoId: promo.ma_khuyen_mai, message: `Giảm ${discount.toLocaleString()}đ` });
        });
    },

    // 7. Thanh toán (BẮT BUỘC ĐĂNG NHẬP)
    checkout: (req, res) => {
        const ma_nguoi_dung = getUserId(req);
        var { tong_tien, dia_chi, ghi_chu, ma_khuyen_mai } = req.body;
        
        if (!ma_nguoi_dung) return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập!" });

        CartModel.getCartByUser(ma_nguoi_dung, (err, cartItems) => {
            if(err || cartItems.length === 0) return res.json({ success: false, message: "Giỏ hàng trống" });

            CartModel.createOrder(ma_nguoi_dung, tong_tien, dia_chi, ghi_chu, ma_khuyen_mai || null, (err, result) => {
                if(err) return res.json({ success: false, message: "Lỗi tạo hóa đơn" });
                
                var orderId = result.insertId;
                var details = cartItems.map(item => [orderId, item.ma_san_pham, item.so_luong, item.gia_ban || 0]); 
                
                CartModel.createOrderDetail(details, (err) => {
                    if(err) return res.json({ success: false, message: "Lỗi chi tiết đơn" });
                    CartModel.clearCart(ma_nguoi_dung, () => {
                        res.json({ success: true, ma_hoa_don: orderId });
                    });
                });
            });
        });
    }
};
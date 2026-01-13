- tải các thư viện :
npm install

npm install mysql2 dotenv bcryptjs body-parser cors express cookie-parser morgan

npm install express-session

npm install ejs

- sao đó chạy lệnh để khởi động bài : nodemon start


CẤU HÌNH CHUNG
Domain: http://localhost:3000/api

Cơ chế: Cookie/Session (Postman tự động lưu sau khi đăng nhập, không cần chỉnh Header).


PHẦN 1: PUBLIC & AUTH (XÁC THỰC)
Dành cho người dùng mới hoặc chưa đăng nhập.

1. Đăng ký tài khoản

Method: POST

URL: http://localhost:3000/api/register

Body (JSON):

JSON

{
    "ho_ten": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "mat_khau": "123456",
    "so_dien_thoai": "0987654321",
    "dia_chi": "Số 1 Đại Cồ Việt, Hà Nội"
}
2. Đăng nhập (Quan trọng: Chạy cái này trước để lấy quyền test các phần sau)

Method: POST

URL: http://localhost:3000/api/login

Body (JSON):

JSON

{
    "email": "nguyenvana@gmail.com",
    "mat_khau": "123456"
}
3. Đăng xuất

Method: GET

URL: http://localhost:3000/api/logout

4. Xem danh sách sản phẩm

Method: GET

URL: http://localhost:3000/api/products

5. Xem chi tiết 1 sản phẩm

Method: GET

URL: http://localhost:3000/api/products/1

6. Xem danh sách danh mục

Method: GET

URL: http://localhost:3000/api/categories




PHẦN 2: USER - GIỎ HÀNG & THANH TOÁN
Yêu cầu: Đã chạy API Đăng nhập.

7. Xem giỏ hàng

Method: GET

URL: http://localhost:3000/api/cart

8. Thêm vào giỏ hàng

Method: POST

URL: http://localhost:3000/api/cart/add

Body (JSON):

JSON

{
    "ma_san_pham": 1,
    "so_luong": 2
}
9. Cập nhật số lượng

Method: PUT

URL: http://localhost:3000/api/cart/update

Body (JSON):

JSON

{
    "ma_gio_hang": 5,
    "so_luong": 10
}
(Lấy ma_gio_hang từ kết quả API số 7)

10. Xóa 1 món khỏi giỏ

Method: DELETE

URL: http://localhost:3000/api/cart/remove/5 (Thay số 5 bằng Mã giỏ hàng cần xóa)

11. Áp dụng mã giảm giá cho người dùng mã giảm giá

CÁCH 1: Test bằng Postman (Khuyên dùng để kiểm tra API)
Vì logic trong Controller CartController.js của bạn yêu cầu Client phải gửi cả totalAmount (tổng tiền hiện tại của giỏ) lên để tính toán mức giảm, nên bạn cần cấu hình như sau:

Đảm bảo đã Đăng nhập: (Chạy API Login trước để có session/cookie).

Method: POST

URL: http://localhost:3000/api/cart/apply-coupon

Body (chọn raw -> JSON): Bạn cần giả lập một số tiền tổng (ví dụ 500.000đ) để server tính toán mức giảm giá.

JSON

{
    "code": "test",
    "totalAmount": 500000
}
Kết quả mong đợi: Server sẽ trả về JSON báo thành công và số tiền được giảm:

JSON

{
    "success": true,
    "discount": 150000,   // (30% của 500k là 150k)
    "promoId": 1,         // ID của mã này trong DB
    "message": "Giảm 150.000đ"
}
12. Thanh toán (Checkout)

BƯỚC 1: Test Thanh Toán (Checkout)
Đây là bước chính bạn muốn kiểm tra.

Method: POST

URL: http://localhost:3000/api/cart/checkout

Headers: Không cần chỉnh (Postman tự gửi Cookie từ bước 1).

Body (Raw > JSON): Bạn cần gửi đầy đủ thông tin mà CartController yêu cầu (tong_tien, dia_chi, ghi_chu, v.v.).

JSON

{
    "tong_tien": 500000,           // Số tiền tổng đơn hàng (đã trừ khuyến mãi)
    "dia_chi": "123 Đường Test, Hà Nội",
    "ghi_chu": "Giao giờ hành chính",
    "ma_khuyen_mai": 1,            // ID mã khuyến mãi (hoặc null nếu không có)
    "ma_nguoi_dung": 1             // (*) Mẹo: Thêm dòng này để chắc chắn Controller nhận được ID user nếu Session lỗi
}
(Lưu ý: Trong code CartController.js của bạn, hàm getUserId có logic dự phòng lấy ID từ req.body.ma_nguoi_dung, nên việc điền thêm dòng ma_nguoi_dung ở trên sẽ giúp việc test dễ thành công hơn).

BƯỚC 2: Kiểm tra Kết quả
Trên Postman:

Nếu thành công: Trả về {"success": true, "ma_hoa_don": ...}.

Nếu thất bại: Trả về lỗi (ví dụ: "Giỏ hàng trống", "Lỗi tạo hóa đơn").




PHẦN 3: ADMIN - QUẢN LÝ (Cần đăng nhập tài khoản Admin)
Tài khoản Admin mẫu: admin@gmail.com / 123456

A. Quản lý SẢN PHẨM
13. Xem tất cả sản phẩm

Method: GET

URL: http://localhost:3000/api/admin/products

14. Thêm sản phẩm mới

Method: POST

URL: http://localhost:3000/api/admin/products

Body (JSON):

JSON

{
    "ten_san_pham": "Dưa hấu không hạt",
    "ma_danh_muc": 2,
    "gia_goc": 60000,
    "khuyen_mai": 10,
    "don_vi_tinh": "qua",
    "nguon_goc": "Long An",
    "mo_ta": "Dưa ngọt, đỏ, vỏ mỏng.",
    "anh_dai_dien": "duahau.jpg"
}
15. Sửa sản phẩm

Method: PUT

URL: http://localhost:3000/api/admin/products/1

Body (JSON):

JSON

{
    "ten_san_pham": "Dưa hấu (Đã cập nhật)",
    "gia_goc": 65000
}
16. Xóa sản phẩm

Method: DELETE

URL: http://localhost:3000/api/admin/products/1

B. Quản lý DANH MỤC
17. Xem danh sách danh mục

Method: GET

URL: http://localhost:3000/api/admin/categories

18. Thêm danh mục mới

Method: POST

URL: http://localhost:3000/api/admin/categories

Body (JSON):

JSON

{ "ten_danh_muc": "Trái cây sấy khô" }
19. Sửa danh mục

Method: PUT

URL: http://localhost:3000/api/admin/categories/1

Body (JSON):

JSON

{ "ten_danh_muc": "Trái cây Nhập Khẩu (VIP)" }
20. Xóa danh mục

Method: DELETE

URL: http://localhost:3000/api/admin/categories/1

C. Quản lý KHUYẾN MÃI
21. Xem danh sách khuyến mãi

Method: GET

URL: http://localhost:3000/api/admin/promotions

22. Thêm khuyến mãi mới

Method: POST

URL: http://localhost:3000/api/admin/promotions

Body (JSON):

JSON

{
    "ma_code": "SALE50",
    "phan_tram_giam": 50,
    "so_tien_giam": 0,
    "ngay_bat_dau": "2025-05-01",
    "ngay_ket_thuc": "2025-05-30"
}
23. Sửa khuyến mãi

Method: PUT

URL: http://localhost:3000/api/admin/promotions/1

Body (JSON):

JSON

{ "phan_tram_giam": 30 }
24. Xóa khuyến mãi

Method: DELETE

URL: http://localhost:3000/api/admin/promotions/1

D. Quản lý NGƯỜI DÙNG & THỐNG KÊ
25. Xem danh sách người dùng

Method: GET

URL: http://localhost:3000/api/admin/users

26. Xóa người dùng

Method: DELETE

URL: http://localhost:3000/api/admin/users/5

27. Xem thống kê doanh thu

Method: GET

URL: http://localhost:3000/api/admin/revenue

PHẦN 4: STAFF - NHÂN VIÊN (Cần đăng nhập tài khoản Staff)
Tài khoản Staff mẫu: nhanvien@gmail.com / 123456

28. Xem danh sách đơn hàng

Method: GET

URL: http://localhost:3000/api/staff/orders

29. Xem chi tiết 1 đơn hàng

Method: GET

URL: http://localhost:3000/api/staff/orders/1 (Thay số 1 bằng Mã hóa đơn)

30. Cập nhật trạng thái đơn (Duyệt/Hủy)

Method: POST

URL: http://localhost:3000/api/staff/orders/update/1

Body (JSON):

JSON

{
    "action": "xac_nhan"
}
Các giá trị action hợp lệ:
"xac_nhan": Chuyển sang "Đã xác nhận".
"huy": Hủy đơn hàng.
"thanh_toan": Xác nhận đã thanh toán/hoàn tất.
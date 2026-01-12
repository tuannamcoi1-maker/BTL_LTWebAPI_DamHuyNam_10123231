- tải các thư viện :
npm install

npm install mysql2 dotenv bcryptjs body-parser cors express cookie-parser morgan

npm install express-session

npm install ejs

- sao đó chạy lệnh để khởi động bài : nodemon start


Giả sử Server đang chạy tại: http://localhost:3000/api

PHẦN 1: PUBLIC (Ai cũng xem được) - Không cần đăng nhập
1. Xem danh sách sản phẩm

Method: GET

URL: http://localhost:3000/api/products

Kết quả mong đợi: Trả về danh sách JSON chứa các loại trái cây (Nho, Lê, Táo...) từ CSDL.

2. Xem chi tiết 1 sản phẩm

Method: GET

URL: http://localhost:3000/api/products/1

Kết quả mong đợi: Trả về thông tin của "Nho đỏ kẹo Candy Snaps".

3. Xem danh mục

Method: GET

URL: http://localhost:3000/api/categories

Kết quả mong đợi: Danh sách: Trái cây nhập khẩu, Nội địa, Nước ép.

PHẦN 2: AUTHENTICATION (Xác thực)
4. Đăng ký tài khoản mới

Method: POST

URL: http://localhost:3000/api/register

Body (JSON):

JSON

{
    "ho_ten": "Nguyễn Văn Test",
    "email": "khachhang@test.com",
    "mat_khau": "123456",
    "so_dien_thoai": "0987654321",
    "dia_chi": "Hà Nội"
}
Kết quả: Thông báo thành công/Tạo user mới trong bảng nguoi_dung.

5. Đăng nhập (QUAN TRỌNG ĐỂ TEST CÁC BƯỚC SAU)

Method: POST

URL: http://localhost:3000/api/login

Body (JSON):

JSON

{
    "email": "khachhang@test.com",
    "password": "123456"
}
Kết quả: Đăng nhập thành công. Lưu ý: Sau bước này Postman đã lưu session, bạn có thể test phần Giỏ hàng.

PHẦN 3: GIỎ HÀNG & THANH TOÁN (Cần Login user thường)
Lưu ý: Giữ nguyên session đăng nhập ở bước 5

6. Thêm vào giỏ hàng

Method: POST

URL: http://localhost:3000/api/cart/add

Body (JSON):

JSON

{
    "ma_san_pham": 1,
    "so_luong": 2
}
Kết quả: Thêm thành công. Kiểm tra bảng gio_hang trong MySQL sẽ thấy dữ liệu.

7. Xem giỏ hàng

Method: GET

URL: http://localhost:3000/api/cart?uid=X (Thay X bằng ID của user vừa đăng nhập, xem trong MySQL để biết ID).

Kết quả: Trả về JSON sản phẩm vừa thêm.

8. Cập nhật số lượng

Method: POST

URL: http://localhost:3000/api/cart/update

Body (JSON):

JSON

{
    "ma_gio_hang": 1, 
    "so_luong": 5
}
Kết quả: Số lượng trong DB đổi thành 5. (Chú ý: ma_gio_hang lấy từ kết quả bước 7).

9. Check mã giảm giá (Nếu có)

Trước tiên vào MySQL tạo 1 mã giảm giá thủ công (vì chưa test admin add).

SQL

INSERT INTO khuyen_mai (ma_code, phan_tram_giam, ngay_bat_dau, ngay_ket_thuc) 
VALUES ('SALE10', 10, '2023-01-01', '2025-12-31');
Method: POST

URL: http://localhost:3000/api/cart/apply-coupon

Body (JSON):

JSON

{ "code": "SALE10", "totalAmount": 500000 }
10. Thanh toán (Checkout)

Method: POST

URL: http://localhost:3000/api/cart/checkout

Body (JSON):

JSON

{
    "ma_nguoi_dung": X,
    "tong_tien": 450000,
    "dia_chi": "Nhà riêng",
    "ghi_chu": "Giao nhanh",
    "ma_khuyen_mai": 1
}
Kết quả: Trả về ma_hoa_don. Giỏ hàng bị xóa sạch. Dữ liệu mới xuất hiện trong bảng hoa_don và chi_tiet_hoa_don.

PHẦN 4: ADMIN API (Cần Đăng nhập Admin)
Cực kỳ quan trọng: Bạn cần đăng xuất user cũ và Đăng nhập lại bằng tài khoản Admin có sẵn trong SQL:

Email: admin@gmail.com

Pass: 123456

11. Xem tất cả User

Method: GET

URL: http://localhost:3000/api/admin/users

12. Xóa User

Method: DELETE

URL: http://localhost:3000/api/admin/users/X (Thay X bằng ID user khách hàng tạo ở Bước 4).

13. Thêm Sản phẩm mới

Method: POST

URL: http://localhost:3000/api/admin/products

Body (JSON):

JSON

{
    "ma_danh_muc": 1,
    "ten_san_pham": "Dưa hấu Long An",
    "gia_goc": 50000,
    "khuyen_mai": 10,
    "don_vi_tinh": "qua",
    "nguon_goc": "Viet Nam",
    "mo_ta": "Ngon ngot"
}
Kết quả: DB có thêm dưa hấu, giá bán tự tính còn 45.000 (nhờ Trigger).

14. Sửa Sản phẩm (API mới)

Method: PUT

URL: http://localhost:3000/api/admin/products/X (X là ID sản phẩm vừa tạo).

Body (JSON): Gửi các trường cần sửa.

15. Xóa Sản phẩm

Method: DELETE

URL: http://localhost:3000/api/admin/products/X

16. Quản lý Danh mục (CRUD)

Test tương tự sản phẩm với URL: /api/admin/categories.

POST để thêm.

PUT /:id để sửa.

DELETE /:id để xóa.

17. Quản lý Khuyến mãi (CRUD)

Test tương tự với URL: /api/admin/promotions.

18. Thống kê doanh thu

Method: GET

URL: http://localhost:3000/api/admin/revenue

Kết quả: JSON tổng tiền từ các hóa đơn đã thanh toán (nếu bạn đã làm bước Checkout).

PHẦN 5: STAFF API (Cần Đăng nhập Nhân viên)
Logout Admin và Login lại:

Email: nhanvien@gmail.com

Pass: 123456

19. Xem danh sách đơn hàng

Method: GET

URL: http://localhost:3000/api/staff/orders

20. Xem chi tiết đơn hàng

Method: GET

URL: http://localhost:3000/api/staff/orders/1 (Thay 1 bằng mã hóa đơn tạo ở bước Checkout).

21. Cập nhật trạng thái đơn (Duyệt đơn)

Method: POST

URL: http://localhost:3000/api/staff/orders/update/1

Body (JSON): (Tùy logic controller của bạn, thường là gửi trạng thái mới)

JSON

{
    "trang_thai": "dang_giao"
}
Kết quả: Kiểm tra bảng hoa_don, cột trang_thai sẽ thay đổi.
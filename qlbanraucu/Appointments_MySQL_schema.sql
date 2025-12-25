CREATE DATABASE btl_QuanLyBanHang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE btl_QuanLyBanHang;
-- 1. Bảng Người dùng (Dùng cho Đăng ký/Đăng nhập)
CREATE TABLE nguoi_dung (
    ma_nguoi_dung INT AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,      -- Tên đăng nhập
    mat_khau VARCHAR(255) NOT NULL,          -- Mật khẩu (lưu hash)
    so_dien_thoai VARCHAR(15),
    dia_chi TEXT,                            -- Khách hàng cần, Admin có thể để trống
    -- CỘT QUAN TRỌNG NHẤT: Phân quyền
    vai_tro ENUM('khach_hang', 'admin', 'nhan_vien') DEFAULT 'khach_hang', 
    trang_thai TINYINT(1) DEFAULT 1,         -- 1: Hoạt động, 0: Bị khóa
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Danh mục (Rau, Củ, Quả...)
CREATE TABLE danh_muc (
    ma_danh_muc INT AUTO_INCREMENT PRIMARY KEY,
    ten_danh_muc VARCHAR(100) NOT NULL
);

-- 3. Bảng Sản phẩm
CREATE TABLE san_pham (
    ma_san_pham INT AUTO_INCREMENT PRIMARY KEY,
    ma_danh_muc INT,
    ten_san_pham VARCHAR(255) NOT NULL,
    gia_ban DECIMAL(10, 2) NOT NULL,
    gia_goc DECIMAL(10, 2),                -- Để hiện giá gạch ngang
    don_vi_tinh VARCHAR(50),               -- kg, bó, vỉ
    nguon_goc VARCHAR(100),
    anh_dai_dien VARCHAR(255),
    mo_ta TEXT,
    FOREIGN KEY (ma_danh_muc) REFERENCES danh_muc(ma_danh_muc)
);

-- 4. Bảng Khuyến mãi (Mã giảm giá)
CREATE TABLE khuyen_mai (
    ma_khuyen_mai INT AUTO_INCREMENT PRIMARY KEY,
    ma_code VARCHAR(50) UNIQUE NOT NULL,   -- Ví dụ: RAUSACH50
    phan_tram_giam INT,                    -- Ví dụ: 10 (là 10%)
    so_tien_giam DECIMAL(10,2),            -- Ví dụ: 20000 (giảm thẳng tiền)
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    trang_thai TINYINT(1) DEFAULT 1        -- 1: Đang chạy, 0: Hết hạn
);

-- 5. Bảng Giỏ hàng (Lưu sản phẩm khách đang chọn nhưng chưa mua)
CREATE TABLE gio_hang (
    ma_gio_hang INT AUTO_INCREMENT PRIMARY KEY,
    ma_nguoi_dung INT,
    ma_san_pham INT,
    so_luong INT DEFAULT 1,
    ngay_them TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung),
    FOREIGN KEY (ma_san_pham) REFERENCES san_pham(ma_san_pham)
);

-- 6. Bảng Hóa đơn (Đơn hàng đã đặt)
CREATE TABLE hoa_don (
    ma_hoa_don INT AUTO_INCREMENT PRIMARY KEY,
    ma_nguoi_dung INT,
    ma_khuyen_mai INT NULL,                -- Mã giảm giá đã áp dụng (nếu có)
    ngay_dat_hang TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tong_tien DECIMAL(10, 2) NOT NULL,     -- Tổng tiền phải thanh toán
    trang_thai VARCHAR(50) DEFAULT 'cho_xac_nhan', -- cho_xac_nhan, dang_giao, da_giao, huy
    dia_chi_giao_hang TEXT,                -- Lưu riêng vì khách có thể đổi địa chỉ
    ghi_chu TEXT,                          -- Lời nhắn cho shipper
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung),
    FOREIGN KEY (ma_khuyen_mai) REFERENCES khuyen_mai(ma_khuyen_mai)
);

-- 7. Bảng Chi tiết hóa đơn (Lưu cụ thể đơn đó mua rau gì, giá lúc đó bao nhiêu)
CREATE TABLE chi_tiet_hoa_don (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_hoa_don INT,
    ma_san_pham INT,
    so_luong INT,
    don_gia_luc_mua DECIMAL(10, 2),        -- Quan trọng: Lưu giá tại thời điểm mua
    FOREIGN KEY (ma_hoa_don) REFERENCES hoa_don(ma_hoa_don),
    FOREIGN KEY (ma_san_pham) REFERENCES san_pham(ma_san_pham)
);

-- 1. Tạo danh mục trước (vì bảng sản phẩm cần ma_danh_muc)
INSERT INTO danh_muc (ten_danh_muc) VALUES ('Trái cây nhập khẩu'), ('Trái cây nội địa'), ('Nước ép');

-- 2. Thêm sản phẩm (Khớp với bảng san_pham mới)
INSERT INTO san_pham (ma_danh_muc, ten_san_pham, gia_ban, gia_goc, don_vi_tinh, nguon_goc, anh_dai_dien, mo_ta) VALUES 
(1, 'Nho đỏ kẹo Candy Snaps - Mỹ', 160000, 200000, 'kg', 'Mỹ', 'TraiCayNhapKhau/nho-do-keo-candy-snaps-my-02-1691377754533.webp', 'Nho siêu ngọt'),
(1, 'Lê Nam Phi', 231000, 330000, 'kg', 'Nam Phi', 'TraiCayNhapKhau/le-nam-phi-02-1691397040336.webp', 'Lê giòn ngọt'),
(1, 'Nho xanh Úc', 280000, 400000, 'kg', 'Úc', 'TraiCayNhapKhau/nho-xanh-uc-03-1691189777298.webp', 'Nho không hạt'),
(1, 'Táo Red Fuji Nam Phi', 320000, 400000, 'kg', 'Nam Phi', 'TraiCayNhapKhau/tao-red-fuji-nam-phi-01-1691395856893.webp', 'Táo đỏ'),
(2, 'Bưởi da xanh Phú Quý', 170000, 300000, 'quả', 'Việt Nam', 'TraiCayNoiDia/buoi-da-xanh-phu-quy-02-1691458892361.webp', 'Bưởi size trung'),
(3, 'Nước ép xoài Bundaberg', 360000, 600000, 'chai', 'Úc', 'NuocEp/Bundaberg-Tropical-Mango.jpg', 'Nước ép cao cấp');

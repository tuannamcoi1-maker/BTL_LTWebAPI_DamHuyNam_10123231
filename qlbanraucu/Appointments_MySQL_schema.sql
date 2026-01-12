-- 1. Xóa database cũ để làm sạch
DROP DATABASE IF EXISTS btl_QuanLyBanHang;

-- 2. Tạo lại Database mới
CREATE DATABASE btl_QuanLyBanHang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE btl_QuanLyBanHang;

-- 3. Tạo bảng Người dùng
CREATE TABLE nguoi_dung (
    ma_nguoi_dung INT AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(15),
    dia_chi TEXT,
    vai_tro ENUM('khach_hang', 'admin', 'nhan_vien') DEFAULT 'khach_hang', 
    trang_thai TINYINT(1) DEFAULT 1,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. THÊM DỮ LIỆU ADMIN VÀ NHÂN VIÊN
INSERT INTO nguoi_dung (ho_ten, email, mat_khau, so_dien_thoai, dia_chi, vai_tro) 
VALUES 
('Quản Trị Viên', 'admin@gmail.com', '123456', '0901234567', 'Văn phòng Admin', 'admin'),
('Nhân Viên Bán Hàng', 'nhanvien@gmail.com', '123456', '0909876543', 'Cửa hàng', 'nhan_vien');

-- 5. Tạo bảng Danh mục (Tạo trước vì Sản phẩm cần dùng)
CREATE TABLE danh_muc (
    ma_danh_muc INT AUTO_INCREMENT PRIMARY KEY,
    ten_danh_muc VARCHAR(100) NOT NULL
);

-- 6. Tạo bảng Sản phẩm (ĐÃ SỬA: Thêm cột khuyen_mai)
CREATE TABLE san_pham (
    ma_san_pham INT AUTO_INCREMENT PRIMARY KEY,
    ma_danh_muc INT,
    ten_san_pham VARCHAR(255) NOT NULL,
    gia_ban DECIMAL(10, 0),          -- Để trống, Trigger sẽ tự tính
    gia_goc DECIMAL(10, 0) NOT NULL,
    khuyen_mai INT DEFAULT 0,        -- [MỚI] Phần trăm giảm giá (VD: 20)
    don_vi_tinh VARCHAR(50),
    nguon_goc VARCHAR(100),
    anh_dai_dien VARCHAR(255),
    mo_ta TEXT,
    FOREIGN KEY (ma_danh_muc) REFERENCES danh_muc(ma_danh_muc)
);

-- ==========================================================
-- [QUAN TRỌNG] TRIGGER TỰ ĐỘNG TÍNH GIÁ BÁN
-- ==========================================================

-- Trigger 1: Tính giá khi THÊM MỚI
DELIMITER //
CREATE TRIGGER trg_tinh_gia_ban_insert
BEFORE INSERT ON san_pham
FOR EACH ROW
BEGIN
    SET NEW.gia_ban = NEW.gia_goc - (NEW.gia_goc * NEW.khuyen_mai / 100);
END;
//
DELIMITER ;

-- Trigger 2: Tính giá khi CẬP NHẬT (Sửa giá gốc hoặc % KM)
DELIMITER //
CREATE TRIGGER trg_tinh_gia_ban_update
BEFORE UPDATE ON san_pham
FOR EACH ROW
BEGIN
    SET NEW.gia_ban = NEW.gia_goc - (NEW.gia_goc * NEW.khuyen_mai / 100);
END;
//
DELIMITER ;

-- ==========================================================

-- 7. Tạo các bảng còn lại
CREATE TABLE khuyen_mai (
    ma_khuyen_mai INT AUTO_INCREMENT PRIMARY KEY,
    ma_code VARCHAR(50) UNIQUE NOT NULL,
    phan_tram_giam INT,
    so_tien_giam DECIMAL(10,0),
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    trang_thai TINYINT(1) DEFAULT 1
);

CREATE TABLE gio_hang (
    ma_gio_hang INT AUTO_INCREMENT PRIMARY KEY,
    ma_nguoi_dung INT,
    ma_san_pham INT,
    so_luong INT DEFAULT 1,
    ngay_them TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung),
    FOREIGN KEY (ma_san_pham) REFERENCES san_pham(ma_san_pham)
);

CREATE TABLE hoa_don (
    ma_hoa_don INT AUTO_INCREMENT PRIMARY KEY,
    ma_nguoi_dung INT,
    ma_khuyen_mai INT NULL,
    ngay_dat_hang TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tong_tien DECIMAL(10, 0) NOT NULL,
    trang_thai VARCHAR(50) DEFAULT 'cho_xac_nhan',
    dia_chi_giao_hang TEXT,
    ghi_chu TEXT,
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung),
    FOREIGN KEY (ma_khuyen_mai) REFERENCES khuyen_mai(ma_khuyen_mai)
);

CREATE TABLE chi_tiet_hoa_don (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_hoa_don INT,
    ma_san_pham INT,
    so_luong INT,
    don_gia_luc_mua DECIMAL(10, 0),
    FOREIGN KEY (ma_hoa_don) REFERENCES hoa_don(ma_hoa_don),
    FOREIGN KEY (ma_san_pham) REFERENCES san_pham(ma_san_pham)
);

-- 8. Thêm dữ liệu mẫu
INSERT INTO danh_muc (ten_danh_muc) VALUES ('Trái cây nhập khẩu'), ('Trái cây nội địa'), ('Nước ép');

-- Thêm sản phẩm (Chỉ cần nhập Giá Gốc và Khuyến Mãi -> Giá bán tự tính)
INSERT INTO san_pham (ma_danh_muc, ten_san_pham, gia_goc, khuyen_mai, don_vi_tinh, nguon_goc, anh_dai_dien, mo_ta) VALUES 
(1, 'Nho đỏ kẹo Candy Snaps - Mỹ', 200000, 20, 'kg', 'Mỹ', 'TraiCayNhapKhau/nho-do-keo-candy-snaps-my-02-1691377754533.webp', 'Nho siêu ngọt'), -- Giá bán sẽ là 160.000
(1, 'Lê Nam Phi', 330000, 30, 'kg', 'Nam Phi', 'TraiCayNhapKhau/le-nam-phi-02-1691397040336.webp', 'Lê giòn ngọt'), -- Giá bán sẽ là 231.000
(1, 'Nho xanh Úc', 400000, 30, 'kg', 'Úc', 'TraiCayNhapKhau/nho-xanh-uc-03-1691189777298.webp', 'Nho không hạt'), -- Giá bán sẽ là 280.000
(1, 'Táo Red Fuji Nam Phi', 400000, 20, 'kg', 'Nam Phi', 'TraiCayNhapKhau/tao-red-fuji-nam-phi-01-1691395856893.webp', 'Táo đỏ'), -- Giá bán sẽ là 320.000
(2, 'Bưởi da xanh Phú Quý', 300000, 43, 'quả', 'Việt Nam', 'TraiCayNoiDia/buoi-da-xanh-phu-quy-02-1691458892361.webp', 'Bưởi size trung'), -- Giá bán ~ 170.000
(3, 'Nước ép xoài Bundaberg', 600000, 40, 'chai', 'Úc', 'NuocEp/Bundaberg-Tropical-Mango.jpg', 'Nước ép cao cấp'); -- Giá bán 360.000
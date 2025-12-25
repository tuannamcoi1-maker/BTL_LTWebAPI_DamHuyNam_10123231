var express = require('express');
var path = require('path');
var mysql = require('mysql2');
var app = express();

// 1. Cấu hình kết nối MySQL
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tuannamcoi1@', // Mật khẩu của bạn
    database: 'btl_QuanLyBanHang' 
});

db.connect((err) => {
    if (err) console.log("Lỗi kết nối CSDL: " + err);
    else console.log("Đã kết nối MySQL thành công!");
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ================= ROUTE GIAO DIỆN =================

// Route Trang chủ (Có hỗ trợ lọc Danh mục)
app.get('/trang-chu', function(req, res) {
    // 1. Lấy mã danh mục từ đường dẫn (nếu có)
    var maDanhMuc = req.query.danhmuc; 
    
    var sqlSP = "SELECT * FROM san_pham";
    var params = [];

    // Nếu có chọn danh mục -> Thêm điều kiện WHERE vào câu lệnh SQL
    if (maDanhMuc) {
        sqlSP += " WHERE ma_danh_muc = ?";
        params.push(maDanhMuc);
    }

    var sqlDM = "SELECT * FROM danh_muc";

    // 2. Thực hiện lấy dữ liệu
    db.query(sqlSP, params, function(err, products) {
        if (err) products = [];
        
        db.query(sqlDM, function(err, categories) {
            if (err) categories = [];
            
            // 3. Gửi dữ liệu sang giao diện
            res.render('btlon', { 
                products: products, 
                categories: categories,
                currentCat: maDanhMuc // Gửi thêm biến này để biết đang chọn cái nào
            });
        });
    });
});

// 2. Chi tiết sản phẩm
app.get('/chi-tiet-san-pham/:id', function(req, res) {
    var id = req.params.id;
    var sqlProduct = "SELECT * FROM san_pham WHERE ma_san_pham = ?";
    var sqlRelated = "SELECT * FROM san_pham WHERE ma_san_pham != ? LIMIT 4";
    
    db.query(sqlProduct, [id], function(err, resultProduct) {
        if (err || resultProduct.length === 0) {
            res.send("Không tìm thấy sản phẩm");
        } else {
            db.query(sqlRelated, [id], function(err, resultRelated) {
                res.render('chi-tiet-san-pham', { 
                    product: resultProduct[0], 
                    relatedProducts: resultRelated 
                });
            });
        }
    });
});

// 3. Các trang khác
app.get('/gio-hang', (req, res) => res.render('gio-hang'));
app.get('/dang-nhap', (req, res) => res.render('dang-nhap'));
app.get('/dang-ky', (req, res) => res.render('dang-ky'));


// ================= API AUTH (Đăng ký/Đăng nhập) =================
app.post('/api/dang-ky', function(req, res) {
    var { ho_ten, email, mat_khau, so_dien_thoai, dia_chi } = req.body;
    var sql = "INSERT INTO nguoi_dung (ho_ten, email, mat_khau, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [ho_ten, email, mat_khau, so_dien_thoai, dia_chi], function(err) {
        if (err) res.json({ success: false, message: "Lỗi đăng ký (Email có thể đã tồn tại)" });
        else res.json({ success: true, message: "Đăng ký thành công" });
    });
});

app.post('/api/dang-nhap', function(req, res) {
    var { email, mat_khau } = req.body;
    var sql = "SELECT * FROM nguoi_dung WHERE email = ? AND mat_khau = ?";
    db.query(sql, [email, mat_khau], function(err, results) {
        if (results.length > 0) res.json({ success: true, user: results[0] });
        else res.json({ success: false, message: "Sai thông tin đăng nhập" });
    });
});


// ================= API GIỎ HÀNG & THANH TOÁN =================

// 1. Thêm vào giỏ
app.post('/api/gio-hang/them', function(req, res) {
    var { ma_nguoi_dung, ma_san_pham, so_luong } = req.body;
    
    // Check xem hàng đã có trong giỏ chưa
    var checkSql = "SELECT * FROM gio_hang WHERE ma_nguoi_dung = ? AND ma_san_pham = ?";
    db.query(checkSql, [ma_nguoi_dung, ma_san_pham], function(err, results) {
        if (results.length > 0) {
            // Có rồi -> Cộng thêm số lượng
            var newQty = results[0].so_luong + parseInt(so_luong);
            var updateSql = "UPDATE gio_hang SET so_luong = ? WHERE ma_gio_hang = ?";
            db.query(updateSql, [newQty, results[0].ma_gio_hang], () => res.json({ success: true }));
        } else {
            // Chưa có -> Thêm mới
            var insertSql = "INSERT INTO gio_hang (ma_nguoi_dung, ma_san_pham, so_luong) VALUES (?, ?, ?)";
            db.query(insertSql, [ma_nguoi_dung, ma_san_pham, so_luong], () => res.json({ success: true }));
        }
    });
});

// 2. Lấy giỏ hàng của user
app.get('/api/gio-hang/:userId', function(req, res) {
    var sql = `SELECT g.ma_gio_hang, g.so_luong, s.ten_san_pham, s.gia_ban, s.anh_dai_dien 
               FROM gio_hang g 
               JOIN san_pham s ON g.ma_san_pham = s.ma_san_pham 
               WHERE g.ma_nguoi_dung = ?`;
    db.query(sql, [req.params.userId], function(err, results) {
        if (err) res.json([]);
        else res.json(results);
    });
});

// 3. Xóa sản phẩm khỏi giỏ
app.delete('/api/gio-hang/xoa/:id', function(req, res) {
    var sql = "DELETE FROM gio_hang WHERE ma_gio_hang = ?";
    db.query(sql, [req.params.id], () => res.json({ success: true }));
});

// 4. THANH TOÁN (Logic quan trọng nhất - Đã cập nhật đầy đủ)
app.post('/api/thanh-toan', function(req, res) {
    var { ma_nguoi_dung, tong_tien, dia_chi, ghi_chu } = req.body;
    
    // Bước 1: Lấy thông tin các món hàng trong giỏ của user này (kèm giá tại thời điểm mua)
    var sqlGetCart = `SELECT g.ma_san_pham, g.so_luong, s.gia_ban 
                      FROM gio_hang g 
                      JOIN san_pham s ON g.ma_san_pham = s.ma_san_pham 
                      WHERE g.ma_nguoi_dung = ?`;

    db.query(sqlGetCart, [ma_nguoi_dung], function(err, cartItems) {
        if (err || cartItems.length === 0) {
            return res.json({ success: false, message: "Giỏ hàng trống hoặc lỗi" });
        }

        // Bước 2: Tạo Hóa đơn (hoa_don)
        var sqlHD = "INSERT INTO hoa_don (ma_nguoi_dung, tong_tien, dia_chi_giao_hang, ghi_chu) VALUES (?, ?, ?, ?)";
        db.query(sqlHD, [ma_nguoi_dung, tong_tien, dia_chi, ghi_chu], function(err, resultHD) {
            if (err) {
                console.log(err);
                return res.json({ success: false, message: "Lỗi tạo hóa đơn" });
            }
            
            var ma_hoa_don_moi = resultHD.insertId; // Lấy ID hóa đơn vừa tạo

            // Bước 3: Thêm từng món vào Chi tiết hóa đơn (chi_tiet_hoa_don)
            var sqlChiTiet = "INSERT INTO chi_tiet_hoa_don (ma_hoa_don, ma_san_pham, so_luong, don_gia_luc_mua) VALUES ?";
            
            // Chuẩn bị dữ liệu mảng 2 chiều để insert nhiều dòng cùng lúc
            var values = cartItems.map(item => [ma_hoa_don_moi, item.ma_san_pham, item.so_luong, item.gia_ban]);

            db.query(sqlChiTiet, [values], function(err) {
                if (err) {
                    console.log(err);
                    return res.json({ success: false, message: "Lỗi lưu chi tiết hóa đơn" });
                }

                // Bước 4: Xóa sạch giỏ hàng của user sau khi đã lưu xong
                var sqlDeleteCart = "DELETE FROM gio_hang WHERE ma_nguoi_dung = ?";
                db.query(sqlDeleteCart, [ma_nguoi_dung], function() {
                    // Thành công tất cả
                    res.json({ success: true, ma_hoa_don: ma_hoa_don_moi });
                });
            });
        });
    });
});

// Chạy server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}/trang-chu`);
});
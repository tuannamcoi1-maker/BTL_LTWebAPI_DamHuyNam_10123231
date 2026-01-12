function themVaoGioHang(maSP) {
    var userStr = localStorage.getItem("user"); // Lưu ý: Code cũ bạn dùng 'currentUser' lúc này dùng 'user' cho đồng bộ
    if (!userStr) {
        // Nếu localStorage chưa có, check 'currentUser' phòng hờ
        userStr = localStorage.getItem("currentUser"); 
    }
    
    if (!userStr) {
        if(confirm("Cần đăng nhập để mua hàng. Đi tới đăng nhập?")) window.location.href = "/dang-nhap";
        return;
    }
    var user = JSON.parse(userStr);

    // [CẬP NHẬT] Đường dẫn API mới
    fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_nguoi_dung: user.ma_nguoi_dung, ma_san_pham: maSP, so_luong: 1 })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) alert("✅ Đã thêm vào giỏ!");
        else alert("❌ Lỗi thêm giỏ hàng (Có thể chưa đăng nhập session).");
    });
}
function themVaoGioHang(maSP) {
    var userStr = localStorage.getItem("currentUser");
    if (!userStr) {
        if(confirm("Cần đăng nhập để mua hàng. Đi tới đăng nhập?")) window.location.href = "/dang-nhap";
        return;
    }
    var user = JSON.parse(userStr);
    fetch('/api/gio-hang/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_nguoi_dung: user.ma_nguoi_dung, ma_san_pham: maSP, so_luong: 1 })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) alert("✅ Đã thêm vào giỏ!");
        else alert("❌ Lỗi thêm giỏ hàng.");
    });
}
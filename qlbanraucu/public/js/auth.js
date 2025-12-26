// Xử lý Đăng Ký
function xuLyDangKy() {
    var hoTen = $('#tenkh').val().trim();
    var sdt = $('#sdtkh').val().trim();
    var email = $('#emailkh').val().trim();
    var diaChi = $('#diachikh').val().trim();
    var matKhau = $('#mkkh').val().trim();
    var nhapLaiMatKhau = $('#mkkh1').val().trim();

    if (!hoTen || !sdt || !email || !diaChi || !matKhau) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    if (matKhau !== nhapLaiMatKhau) {
        alert("Mật khẩu nhập lại không khớp!");
        return;
    }

    fetch('/api/dang-ky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ho_ten: hoTen, so_dien_thoai: sdt, email: email, dia_chi: diaChi, mat_khau: matKhau })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Đăng ký thành công!");
            window.location.href = "/dang-nhap";
        } else {
            alert("Đăng ký thất bại: " + data.message);
        }
    })
    .catch(err => alert("Lỗi kết nối server"));
}

// Xử lý Đăng Nhập
function xuLyDangNhap(event) {
    event.preventDefault();
    var emailInput = $('#tk').val().trim();
    var matkhauInput = $('#mk').val().trim();

    if(emailInput === "" || matkhauInput === "") {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    fetch('/api/dang-nhap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, mat_khau: matkhauInput })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Đăng nhập thành công!");
            
            // Lưu local để hiển thị tên trên Header
            localStorage.setItem("username", data.user.ho_ten);
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            
            // CHUYỂN HƯỚNG THEO SERVER CHỈ ĐỊNH (Admin/Staff/User)
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                window.location.href = "/trang-chu";
            }
        } else {
            alert("Lỗi: " + data.message);
        }
    })
    .catch(err => alert("Lỗi kết nối server"));
}
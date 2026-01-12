function xuLyDangKy() {
    // ... logic lấy giá trị input giữ nguyên ...
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

    // [CẬP NHẬT] Đường dẫn API mới
    fetch('/api/register', { 
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

function xuLyDangNhap(event) {
    event.preventDefault();
    var emailInput = $('#tk').val().trim();
    var matkhauInput = $('#mk').val().trim();

    if(emailInput === "" || matkhauInput === "") {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // [CẬP NHẬT] Đường dẫn API mới
    fetch('/api/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, mat_khau: matkhauInput })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Đăng nhập thành công!");
            localStorage.setItem("user", JSON.stringify(data.user)); 
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
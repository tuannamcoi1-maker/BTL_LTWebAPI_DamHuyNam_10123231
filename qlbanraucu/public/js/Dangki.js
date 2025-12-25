// public/js/Dangki.js

function DangKy() {
    // 1. Lấy dữ liệu từ form
    var tenkh = document.getElementById("tenkh").value.trim();
    var sdtkh = document.getElementById("sdtkh").value.trim();
    var emailkh = document.getElementById("emailkh").value.trim();
    var diachikh = document.getElementById("diachikh").value;
    var mkkh = document.getElementById("mkkh").value;
    var mkkh1 = document.getElementById("mkkh1").value;
    
    // Regex kiểm tra số điện thoại
    var number = /^[0-9]+$/;
    var atposition = emailkh.indexOf("@");
    var dotposition = emailkh.lastIndexOf(".");

    // 2. Validate (Kiểm tra dữ liệu nhập vào) - Giữ nguyên logic cũ của bạn
    if (tenkh === "") {
        alert("Tên khách hàng không được để trống! Vui lòng nhập lại!");
        return;
    }
    if (sdtkh === "" || !sdtkh.match(number) || sdtkh.length !== 10) {
        alert("Số điện thoại khách hàng không hợp lệ! Vui lòng nhập lại!");
        return;
    }
    if (emailkh === "" || (atposition < 1 || dotposition < atposition + 2 || dotposition + 2 >= emailkh.length)) {
        alert("Email khách hàng không hợp lệ! Vui lòng nhập lại!");
        return;
    }
    if (diachikh == null || diachikh == "") {
        alert("Địa chỉ khách hàng không được để trống! Vui lòng nhập lại!");
        return false;
    }
    if (mkkh === "") {
        alert("Mật khẩu khách hàng không được để trống! Vui lòng nhập lại!");
        return;
    }
    if (mkkh1 === "" || mkkh !== mkkh1) {
        alert("Mật khẩu xác nhận không khớp! Vui lòng nhập lại!");
        return;
    }

    // 3. Chuẩn bị dữ liệu để gửi về Server (Backend Node.js)
    // Lưu ý: Tên key (bên trái dấu :) phải khớp với req.body trong authController.js
    var dataToSend = {
        ho_ten: tenkh,
        so_dien_thoai: sdtkh,
        email: emailkh,
        dia_chi: diachikh,
        mat_khau: mkkh
    };

    // 4. Gọi API Đăng ký
    fetch('/api/dang-ky', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            window.location.href = "DangNhap.html";
        } else {
            // Hiển thị lỗi từ server trả về (ví dụ: Email đã tồn tại)
            alert("Đăng ký thất bại: " + result.message);
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert("Không thể kết nối tới Server. Hãy chắc chắn bạn đã chạy 'node app.js'");
    });
}
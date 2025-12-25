document.addEventListener("DOMContentLoaded", function () {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    let username = localStorage.getItem("username"); // Giả sử bạn lưu tên người dùng trong localStorage khi đăng nhập

    if (username) {
         // Nếu người dùng đã đăng nhập, ẩn các liên kết Đăng ký và Đăng nhập
        document.getElementById("signupLink").style.display = "none";
        document.getElementById("loginLink").style.display = "none";

         // Hiển thị phần tên tài khoản và menu người dùng đã đăng nhập
        document.getElementById("boxrighttopKH").style.display = "inline"; // Hiển thị phần người dùng đã đăng nhập
        document.getElementById("tenkhachhang").textContent = username; // Hiển thị tên tài khoản
    } 
    else {
         // Nếu người dùng chưa đăng nhập, hiển thị các liên kết Đăng ký và Đăng nhập
        document.getElementById("signupLink").style.display = "inline";
        document.getElementById("loginLink").style.display = "inline";

         // Ẩn phần tên tài khoản và menu người dùng đã đăng nhập
        document.getElementById("boxrighttopKH").style.display = "none";
    }
});

 // Hàm đăng nhập (giả sử bạn có một form đăng nhập để lưu username vào localStorage)
function login(username) {
    // Lưu thông tin người dùng vào localStorage
    localStorage.setItem("username", username);

    // Cập nhật giao diện sau khi đăng nhập
    document.getElementById("signupLink").style.display = "none";
    document.getElementById("loginLink").style.display = "none";
    document.getElementById("boxrighttopKH").style.display = "inline";
    document.getElementById("tenkhachhang").textContent = username;
}

    // Hàm đăng xuất
function logout() {
    // Xóa thông tin người dùng khỏi localStorage
localStorage.removeItem("username");

// Cập nhật giao diện sau khi đăng xuất
document.getElementById("signupLink").style.display = "inline";
document.getElementById("loginLink").style.display = "inline";
document.getElementById("boxrighttopKH").style.display = "none";
}
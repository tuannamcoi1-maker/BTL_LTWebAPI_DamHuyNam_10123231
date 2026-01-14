$(document).ready(function() {
    checkLoginHeader();
});

// Hàm kiểm tra đăng nhập và hiển thị tên người dùng
function checkLoginHeader() {
    // Lấy thông tin user từ LocalStorage
    var userJson = localStorage.getItem('user');
    
    if (userJson) {
        var user = JSON.parse(userJson);
        
        // 1. Hiển thị tên người dùng lên Header
        $('#tenkhachhang').text(user.ho_ten);
        
        // 2. Đổi giao diện: Ẩn nút Đăng nhập -> Hiện Avatar User
        $('#boxrighttop').hide(); 
        $('#boxrighttopKH').show(); 

        // 3. LOGIC MỚI: Thêm link "Trang Quản Trị" hoặc "Trang Nhân Viên"
        var menu = $('.header__navbar-user-menu');
        
        // Bước 3.1: Xóa các link cũ (nếu có) để tránh bị lặp khi tải lại trang
        menu.find('.role-link').remove();

        var linkHtml = '';

        // Bước 3.2: Kiểm tra vai trò để tạo link tương ứng
        if(user.vai_tro === 'admin') {
            // Nếu là Admin -> Link về Dashboard
            linkHtml = '<li class="header__navbar-user-item role-link"><a href="/admin/dashboard" style="color: #d35400; font-weight: bold;"><i class="fas fa-user-shield"></i> Trang Quản Trị</a></li>';
        } 
        else if(user.vai_tro === 'nhan_vien') {
            // Nếu là Nhân viên -> Link về trang Đơn hàng
            linkHtml = '<li class="header__navbar-user-item role-link"><a href="/staff/orders" style="color: #2980b9; font-weight: bold;"><i class="fas fa-clipboard-list"></i> Trang Nhân Viên</a></li>';
        }

        // Bước 3.3: Chèn link vào ĐẦU danh sách menu (trên dòng "Tài khoản của tôi")
        if(linkHtml) {
            menu.prepend(linkHtml);
        }

    } else {
        // Nếu chưa đăng nhập
        $('#boxrighttop').show();
        $('#boxrighttopKH').hide();
    }
}

function logout() {
    localStorage.removeItem("user"); // Sửa thành 'user' cho khớp với hàm checkLoginHeader
    // localStorage.removeItem("username"); // Dòng này có thể không cần nếu bạn lưu tất cả trong 'user'
    window.location.href = "/dang-nhap";
}
$(document).ready(function() {
    checkLoginHeader(); // Hàm cũ của bạn

    //Lắng nghe phím Enter cho ô tìm kiếm
    $('#searchInput').on('keypress', function(e) {
        if (e.which == 13) { // 13 là mã phím Enter
            thucHienTimKiem();
        }
    });
});

function thucHienTimKiem() {
    const keyword = $('#searchInput').val().trim();
    if (!keyword) {
        alert("Vui lòng nhập tên sản phẩm cần tìm!");
        return;
    }
    // Chuyển hướng trang kèm tham số q
    window.location.href = `/trang-chu?q=${encodeURIComponent(keyword)}`;
}
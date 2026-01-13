// --- CÁC HÀM XỬ LÝ GIAO DIỆN CŨ (GIỮ NGUYÊN) ---
function openTab(tabId) {
    // Ẩn tất cả tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    
    // Hiện tab được chọn
    document.getElementById(tabId).classList.add('active');
    
    // Highlight menu (tìm thẻ a chứa sự kiện onclick tương ứng)
    const activeLink = document.querySelector(`.menu-item[onclick="openTab('${tabId}')"]`);
    if(activeLink) activeLink.classList.add('active');
}

function toggleForm(formId) {
    var x = document.getElementById(formId);
    x.style.display = x.style.display === "none" ? "block" : "none";
}

// --- LOGIC MỚI: HIỂN THỊ THÔNG BÁO TỪ URL (SAU KHI REDIRECT) ---
// Code này sẽ chạy ngay khi trang Admin tải xong
document.addEventListener('DOMContentLoaded', function() {
    // 1. Kiểm tra xem trên thanh địa chỉ có tham số ?status=... và &message=... không
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const message = urlParams.get('message');

    // 2. Nếu có thông báo thì hiện hộp thoại Alert
    if (status && message) {
        if (status === 'error') {
            alert("❌ LỖI: " + message);
        } else if (status === 'success') {
            alert("✅ THÀNH CÔNG: " + message);
        }

        // 3. Xóa sạch tham số trên thanh địa chỉ URL
        // Giúp khi người dùng F5 (tải lại trang) thì không bị hiện thông báo lại nữa
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
});
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
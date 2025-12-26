// API: Xem chi tiết
function xemChiTiet(id) {
    $('#modalOrderId').text(id);
    fetch('/staff/orders/detail/' + id)
    .then(res => res.json())
    .then(data => {
        let html = '';
        data.forEach(item => {
            html += `<tr>
                <td><img src="/img/${item.anh_dai_dien}" width="50"></td>
                <td>${item.ten_san_pham}</td>
                <td>${item.don_gia_luc_mua.toLocaleString()}₫</td>
                <td>${item.so_luong}</td>
                <td>${(item.don_gia_luc_mua * item.so_luong).toLocaleString()}₫</td>
            </tr>`;
        });
        $('#modalBody').html(html);
        $('#detailModal').show();
    });
}

// API: Cập nhật trạng thái
function capNhatTrangThai(id, action) {
    if(!confirm("Bạn chắc chắn muốn thực hiện hành động này?")) return;

    fetch('/staff/orders/update/' + id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert("Cập nhật thành công!");
            location.reload(); 
        } else {
            alert("Lỗi cập nhật.");
        }
    });
}

// Đóng modal khi click ra ngoài (Sử dụng jQuery)
$(window).on('click', function(event) {
    if (event.target == document.getElementById('detailModal')) {
        $('#detailModal').hide();
    }
});
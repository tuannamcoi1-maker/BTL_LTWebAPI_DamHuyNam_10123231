var currentUser = null;
var cartData = [];

$(document).ready(function() {
    var userStr = localStorage.getItem("currentUser");
    if (userStr) {
        currentUser = JSON.parse(userStr);
        loadCart();
    } else {
        alert("Bạn cần đăng nhập để xem giỏ hàng!");
        window.location.href = "/dang-nhap";
    }
});

function loadCart() {
    if(!currentUser) return;
    fetch('/api/gio-hang/' + currentUser.ma_nguoi_dung)
    .then(res => res.json())
    .then(data => {
        cartData = data;
        renderCart(data);
    })
    .catch(err => console.error(err));
}

function renderCart(items) {
    var html = '';
    var total = 0;
    if(items.length === 0) {
        $('#cartBody').html('<tr><td colspan="5" style="text-align:center;">Giỏ hàng trống</td></tr>');
        $('#totalPrice').text('0₫');
        return;
    }
    items.forEach(item => {
        total += item.gia_ban * item.so_luong;
        html += `<tr>
                    <td><img src="/img/${item.anh_dai_dien}" width="60"></td>
                    <td>${item.ten_san_pham}</td>
                    <td style="color:red; font-weight:bold;">${item.gia_ban.toLocaleString()}₫</td>
                    <td>${item.so_luong}</td>
                    <td><button onclick="xoaItem(${item.ma_gio_hang})" style="color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td>
                 </tr>`;
    });
    $('#cartBody').html(html);
    $('#totalPrice').text(total.toLocaleString() + '₫');
}

function xoaItem(id) {
    if(confirm("Xóa sản phẩm này?")) {
        fetch('/api/gio-hang/xoa/' + id, { method: 'DELETE' })
        .then(res => res.json()).then(d => { if(d.success) loadCart(); });
    }
}

function thanhToan() {
    if (!currentUser) return alert("Vui lòng đăng nhập!");
    if(cartData.length === 0) return alert("Giỏ hàng trống!");
    
    var bankName = $('#bankName').val();
    var bankAccount = $('#bankAccount').val().trim();
    if (bankName === "") return alert("Chưa chọn ngân hàng!");
    if (bankAccount === "" || !/^\d+$/.test(bankAccount)) return alert("Số tài khoản không hợp lệ!");

    if(confirm("Xác nhận thanh toán?")) {
        var total = cartData.reduce((a, b) => a + (b.gia_ban * b.so_luong), 0);
        fetch('/api/thanh-toan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ma_nguoi_dung: currentUser.ma_nguoi_dung,
                tong_tien: total,
                dia_chi: currentUser.dia_chi,
                ghi_chu: `NH: ${bankName} - STK: ${bankAccount}`
            })
        }).then(res => res.json()).then(data => {
            if(data.success) { alert("Đặt hàng thành công!"); loadCart(); }
            else { alert("Lỗi: " + data.message); }
        });
    }
}
var currentUser = null;
var cartData = [];
// Biến lưu thông tin khuyến mãi hiện tại
var currentPromo = {
    id: null,
    discountAmount: 0
};

$(document).ready(function() {
    var userStr = localStorage.getItem("user") || localStorage.getItem("currentUser");
    
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
    
    // SỬA THÀNH: Truyền uid qua query string
    fetch('/api/cart?uid=' + currentUser.ma_nguoi_dung)
    .then(res => res.json())
    .then(data => {
        // Kiểm tra xem data trả về có đúng format không
        console.log("Dữ liệu giỏ hàng:", data); 
        
        cartData = Array.isArray(data) ? data : (data.data || []);
        renderCart(cartData);
    })
    .catch(err => console.error("Lỗi tải giỏ hàng:", err));
}

// Hàm áp dụng mã giảm giá
function applyCoupon() {
    var code = $('#couponCode').val().trim();
    if(!code) return alert("Vui lòng nhập mã!");

    // Tính tổng tiền tạm tính trước
    var tempTotal = cartData.reduce((a, b) => a + (b.gia_ban * b.so_luong), 0);

    fetch('/api/cart/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            code: code,
            totalAmount: tempTotal
        })
    })
    .then(res => res.json())
    .then(data => {
        var msgBox = $('#couponMessage');
        if(data.success) {
            // Lưu thông tin khuyến mãi
            currentPromo.id = data.promoId;
            currentPromo.discountAmount = data.discount;
            
            msgBox.text(data.message).css('color', 'green');
            // Render lại để cập nhật số tiền
            renderCart(cartData); 
        } else {
            // Reset khuyến mãi nếu lỗi
            currentPromo.id = null;
            currentPromo.discountAmount = 0;
            msgBox.text(data.message).css('color', 'red');
            renderCart(cartData); 
        }
    });
}

function updateQuantity(cartId, newQty) {
    if (newQty < 1) return xoaItem(cartId);

    fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_gio_hang: cartId, so_luong: newQty })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Khi đổi số lượng, reset lại mã giảm giá để tính lại cho chính xác
            currentPromo.id = null; 
            currentPromo.discountAmount = 0;
            $('#couponCode').val('');
            $('#couponMessage').text('');
            
            loadCart(); 
        }
    });
}

function xoaItem(id) {
    if(confirm("Xóa sản phẩm này khỏi giỏ hàng?")) {
        fetch('/api/cart/remove/' + id, { method: 'DELETE' })
        .then(res => res.json()).then(d => { 
            if(d.success) {
                currentPromo.id = null;
                currentPromo.discountAmount = 0;
                loadCart(); 
            }
        });
    }
}

function thanhToan() {
    if (!currentUser) return alert("Vui lòng đăng nhập!");
    if(cartData.length === 0) return alert("Giỏ hàng trống!");
    
    var bankName = $('#bankName').val();
    var bankAccount = $('#bankAccount').val().trim();
    if (bankName === "") return alert("Chưa chọn ngân hàng!");
    if (bankAccount === "" || !/^\d+$/.test(bankAccount)) return alert("Số tài khoản không hợp lệ!");

    if(confirm("Xác nhận thanh toán đơn hàng?")) {
        // Tính toán lại lần cuối
        var tempTotal = cartData.reduce((a, b) => a + (b.gia_ban * b.so_luong), 0);
        var finalTotal = tempTotal - currentPromo.discountAmount;
        if(finalTotal < 0) finalTotal = 0;

        fetch('/api/cart/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ma_nguoi_dung: currentUser.ma_nguoi_dung,
                tong_tien: finalTotal, // Gửi tổng tiền đã trừ khuyến mãi
                dia_chi: currentUser.dia_chi,
                ghi_chu: `NH: ${bankName} - STK: ${bankAccount}`,
                ma_khuyen_mai: currentPromo.id // Gửi mã khuyến mãi lên server
            })
        }).then(res => res.json()).then(data => {
            if(data.success) { 
                alert("Đặt hàng thành công!"); 
                currentPromo = { id: null, discountAmount: 0 }; // Reset
                loadCart(); 
            }
            else { alert("Lỗi: " + data.message); }
        });
    }
}

function renderCart(items) {
    var html = '';
    var tempTotal = 0;
    
    if(items.length === 0) {
        $('#cartBody').html('<tr><td colspan="5" style="text-align:center; padding: 20px;">Giỏ hàng trống</td></tr>');
        $('#tempPrice').text('0₫');
        $('#discountPrice').text('-0₫');
        $('#totalPrice').text('0₫');
        return;
    }

    items.forEach(item => {
        tempTotal += item.gia_ban * item.so_luong;
        html += `<tr>
                    <td><img src="/img/${item.anh_dai_dien}" width="60"></td>
                    <td style="font-weight: 500;">${item.ten_san_pham}</td>
                    <td style="color:#E34426; font-weight:bold;">${item.gia_ban.toLocaleString()}₫</td>
                    <td>
                        <div class="qty-box">
                            <button class="qty-btn" onclick="updateQuantity(${item.ma_gio_hang}, ${item.so_luong - 1})">-</button>
                            <input type="text" class="qty-input" value="${item.so_luong}" readonly>
                            <button class="qty-btn" onclick="updateQuantity(${item.ma_gio_hang}, ${item.so_luong + 1})">+</button>
                        </div>
                    </td>
                    <td>
                        <button onclick="xoaItem(${item.ma_gio_hang})" style="color:#999; border:none; background:none; cursor:pointer; font-size: 16px;">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </td>
                 </tr>`;
    });

    // Tính tổng cuối
    var finalTotal = tempTotal - currentPromo.discountAmount;
    if(finalTotal < 0) finalTotal = 0;

    $('#cartBody').html(html);
    
    // Cập nhật hiển thị các con số
    $('#tempPrice').text(tempTotal.toLocaleString() + '₫');
    $('#discountPrice').text('-' + currentPromo.discountAmount.toLocaleString() + '₫');
    $('#totalPrice').text(finalTotal.toLocaleString() + '₫');
}
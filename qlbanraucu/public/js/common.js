$(document).ready(function() {
    checkLoginHeader();
});

function checkLoginHeader() {
    var userStr = localStorage.getItem("currentUser");
    if (userStr) {
        var user = JSON.parse(userStr);
        $('#tenkhachhang').text(user.ho_ten);
        $('#boxrighttop').hide();
        $('#boxrighttopKH').show();
    } else {
        $('#boxrighttop').show();
        $('#boxrighttopKH').hide();
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("username");
    window.location.href = "/dang-nhap";
}
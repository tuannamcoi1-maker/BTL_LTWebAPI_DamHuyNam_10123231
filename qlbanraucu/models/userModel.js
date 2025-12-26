const db = require('../config/db');

module.exports = {
    create: (data, callback) => {
        var sql = "INSERT INTO nguoi_dung (ho_ten, email, mat_khau, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [data.ho_ten, data.email, data.mat_khau, data.so_dien_thoai, data.dia_chi], callback);
    },
    findByEmailAndPassword: (email, mat_khau, callback) => {
        var sql = "SELECT * FROM nguoi_dung WHERE email = ? AND mat_khau = ?";
        db.query(sql, [email, mat_khau], callback);
    }
};
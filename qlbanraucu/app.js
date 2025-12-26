var express = require('express');
var path = require('path');
var session = require('express-session'); // Bạn nhớ chạy: npm install express-session
var app = express();
var webRoutes = require('./routes/web'); 

// Cấu hình View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cấu hình Static folder & Parser
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CẤU HÌNH SESSION (QUAN TRỌNG CHO PHÂN QUYỀN)
app.use(session({
    secret: 'secret_key_nam_fruit_2025', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // Session sống trong 1 giờ
}));

// Sử dụng Route
app.use('/', webRoutes);

// Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}/trang-chu`);
});
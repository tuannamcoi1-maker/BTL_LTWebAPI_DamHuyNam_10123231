var express = require('express');
var path = require('path');
var session = require('express-session'); 
var app = express();

// Import Routes
var webRoutes = require('./routes/web'); 
var apiRoutes = require('./routes/api'); 

// Swagger (Tài liệu API)
var swaggerUi = require('swagger-ui-express');
var swaggerJsdoc = require('swagger-jsdoc');

// Cấu hình View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cấu hình Static folder & Parser
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CẤU HÌNH SESSION
app.use(session({
    secret: 'secret_key_nam_fruit_2025', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } 
}));

// Cấu hình Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Nam Fruit API', version: '1.0.0' },
        servers: [{ url: 'http://localhost:3000/api' }],
    },
    apis: ['./routes/*.js'], 
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- ĐĂNG KÝ ROUTE ---
app.use('/', webRoutes);      // Giao diện Web (HTML)
app.use('/api', apiRoutes);   // API Data (JSON)

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Web chạy tại: http://localhost:${PORT}/trang-chu`);
    console.log(`API Endpoint: http://localhost:${PORT}/api/products`);
});
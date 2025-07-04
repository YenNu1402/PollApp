import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import config from './configs/mongoose.config.js';
import connectDB from './configs/mongoDB.config.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/authenticateJWT.js';
import path from 'path';


// Khởi tạo express
const app = express();

// Kết nối database
const startServer = async () => {
  try {
    await connectDB();

// Logger trong môi trường development
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}


// Thiết lập view engine là EJS
app.set('view engine', 'ejs');

// Thiết lập thư mục views (nên đặt ở gốc project)
app.set('views', path.join(process.cwd(), 'views'));

// Body parser
app.use(express.json({ limit: '10kb' })); // Giới hạn kích thước body
app.use(express.urlencoded({ extended: true }));

// Middleware bảo mật
app.use(cors()); // Cho phép CORS -- cách hoạt động: cho phép các request từ các domain khác được gửi đến server
app.use(helmet()); // Bảo mật headers -- cách hoạt động: giới hạn các headers được gửi đến server
app.use(mongoSanitize()); //Bảo mật và ngăn chặn MongoDB Injection -- cách hoạt động: loại bỏ $ và . trong keys của request
app.use(xss()); // Chống XSS -- cách hoạt động: loại bỏ các thẻ HTML và JavaScript từ request

// Giới hạn request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100 // Giới hạn mỗi IP 100 request trong 15 phút
});
app.use('/api/', limiter);

// Root route - phải đặt trước notFound middleware
app.get('/', (req, res) => {
  res.render('home', { title: 'Trang chủ', username: 'Yến' });
  // res.status(200).json({
  //   success: true,
  //   message: 'Chào mừng đến với Poll App!',
  //   endpoints: {
  //     health: '/api/health',
  //     auth: '/api/auth',
  //     polls: '/api/polls',
  //     users: '/api/users',
  //     votes: '/api/votes'
  //   },
  //   timestamp: new Date().toISOString()
  // });
});

// app.get('/api/info', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Chào mừng đến với Poll App!',
//     endpoints: {
//       health: '/api/health',
//       auth: '/api/auth',
//       polls: '/api/polls',
//       users: '/api/users',
//       votes: '/api/votes'
//     },
//     timestamp: new Date().toISOString()
//   });
// });

// Sử dụng routes chính
app.use('/api', apiRoutes);

// Middleware xử lý 404 đặt sau tất cả các route
app.use(notFound);
// Middleware xử lý lỗi chung
app.use(errorHandler);

// Khởi động server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server cổng ${PORT}`);
});

} catch (err) {
    console.error('Lỗi khi khởi động server:', err);
    process.exit(1);
  }
};

startServer();

export default app; 
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


// Khởi tạo express
const app = express();

// Kết nối database
const startServer = async () => {
  try {
    await connectDB();

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

// Logger trong môi trường development
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api', apiRoutes);

// Xử lý route không tồn tại
app.use(notFound);

// Xử lý lỗi toàn cục
app.use(errorHandler);

// Khởi động server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

} catch (err) {
    console.error('Lỗi khi khởi động server:', err);
    process.exit(1);
  }
};

startServer();

export default app; 
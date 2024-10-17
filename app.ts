import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import { createProxyMiddleware } from 'http-proxy-middleware';
import connectDB from './src/providers/database';
import userRoutes from './src/routes/userRoutes';
import adminRoutes from './src/routes/adminRoutes';
import channelRoutes from './src/routes/channelRoutes'
import path from 'path';
import videoRoutes from './src/routes/videoRoutes'
import liveRoutes from './src/routes/liveRoutes'
const app = express();
connectDB()
// Middleware to enable CORS
const corsOptions = {
  origin: 'https://www.streamhub.today',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));

// Session middleware
app.use(session({
  secret: 'session123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/uploads', express.static(path.join(__dirname, 'src', 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'src', 'public')));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/channel',channelRoutes);
app.use('/api/video',videoRoutes);
app.unsubscribe('/api/live',liveRoutes)





app.use('/', createProxyMiddleware({ target: "https://www.streamhub.today", changeOrigin: true, 
  pathRewrite: {'^/uploads': '/uploads' 
} }));

export default app;

//import libraries
import express, {json} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

//import endpoint routers
import authRouter from './auth-routes/user-auth-route.js';
import appointmentHistoryRouter from './routes/appointment-history-routes.js';
import appointmentsRouter from './routes/appointments-routes.js';
import clientRouter from './routes/client-routes.js';
import clientUserQuestionsRouter from './routes/client-user-questions-routes.js';
import emailVerificationRouter from './routes/email-verification-routes.js';
import ratingsRouter from './routes/ratings-routes.js';
import reviewsRouter from './routes/reviews-routes.js';
import securityQuestionsRouter from './routes/security-questions-routes.js';
import photoRouter from './routes/photos-routes.js';
import servicesRouter from './routes/services-routes.js';
import adminRouter from './routes/admin-routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Performance Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:", "http:"],
    },
  },
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS configuration
const corsOptions = {
  credentials: true, 
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000'
};

app.use(cors(corsOptions));
app.use(json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

//configure routers to redirect to endpoints
app.use('/auth', authRouter);
app.use('/clients', clientRouter);
app.use('/email-verification', emailVerificationRouter);
app.use('/appointments', appointmentsRouter);
app.use('/appointment-history', appointmentHistoryRouter);
app.use('/ratings', ratingsRouter);
app.use('/reviews', reviewsRouter);
app.use('/security-questions', securityQuestionsRouter);
app.use('/client-user-questions', clientUserQuestionsRouter);
app.use('/services', servicesRouter);
app.use('/photos', photoRouter);
app.use('/admins', adminRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`));
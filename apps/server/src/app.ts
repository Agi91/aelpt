import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import apiRouter from './routes';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Standard Security & Utility Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Global API rate limiting
app.use(apiLimiter);

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Router registration
app.use('/api/v1', apiRouter);

// Global Error Handler Middleware — Must be registered last
app.use(errorMiddleware);

export default app;

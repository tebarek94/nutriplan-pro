import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { RowDataPacket } from 'mysql2';

// Import middleware
import { errorHandler, notFound, handleUnhandledRejection, handleUncaughtException } from './middleware/errorHandler';
import { authenticateToken, requireUser, requireAdmin } from './middleware/auth';
import { validateRequest } from './middleware/validation';

// Import routes
import routes from './routes';

// Import validation schemas
import { authSchemas, userProfileSchemas, recipeSchemas, mealPlanSchemas } from './middleware/validation';

// Import database
import { testConnection } from './config/database';
import pool from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on('unhandledRejection', handleUnhandledRejection);

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NutriPlan Pro API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test admin endpoint without authentication
app.get('/test-admin', async (req, res) => {
  try {
    // Test database connection
    const [userCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM users'
    );
    
    res.json({
      success: true,
      message: 'Admin test endpoint working',
      userCount: userCount[0].total,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

// Mount all routes
app.use(routes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 NutriPlan Pro API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

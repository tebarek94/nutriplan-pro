# NutriPlan Pro 🥗

**AI-Powered Nutrition and Meal Planning Platform**

A comprehensive web application that combines artificial intelligence with nutrition science to provide personalized meal planning, recipe management, and health tracking for users and administrators.

## 🌟 Features

### For Users
- **AI-Generated Meal Plans**: Personalized meal plans based on dietary preferences, goals, and restrictions
- **Recipe Management**: Create, save, and share custom recipes with nutritional information
- **Progress Tracking**: Monitor health metrics, weight, and nutrition goals over time
- **Smart Suggestions**: AI-powered recipe and meal plan recommendations
- **User Dashboard**: Comprehensive overview of meal plans, progress, and recommendations
- **Profile Management**: Detailed user profiles with dietary preferences and health information

### For Administrators
- **User Management**: Complete user administration and profile oversight
- **Recipe Approval System**: Review and approve user-submitted recipes and suggestions
- **Analytics Dashboard**: Track platform usage, user engagement, and nutrition trends
- **Content Management**: Manage food categories, ingredients, and nutritional data
- **AI Generation Management**: Monitor and manage AI-generated content

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MySQL** database with comprehensive schema
- **JWT** authentication
- **Google Generative AI** for AI-powered features
- **Nodemailer** for email functionality
- **Multer** for file uploads
- **Helmet** for security
- **Express Rate Limiting** for API protection

### AI Integration
- **Google Generative AI** for meal plan and recipe generation
- **Smart nutritional analysis** and recommendations
- **Personalized content** based on user preferences

## 📁 Project Structure

```
finalsmea/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── models/         # Data models
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── config/         # Configuration files
│   └── complete-database.sql # Database schema and sample data
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nutriplan-pro.git
   cd nutriplan-pro
   ```

2. **Set up the database**
   ```bash
   cd server
   mysql -u your_username -p < complete-database.sql
   ```

3. **Configure environment variables**
   ```bash
   # In server directory
   cp env.example .env
   # Edit .env with your database credentials and API keys
   ```

4. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

5. **Start the development servers**
   ```bash
   # Start backend server (from server directory)
   npm run dev

   # Start frontend server (from client directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/health

## 🔧 Configuration

### Environment Variables (server/.env)
```env
# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=nutriplan_pro

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 📊 Database Schema

The application uses a comprehensive MySQL database with the following main tables:
- **users**: User accounts and authentication
- **user_profiles**: Detailed user health and dietary information
- **recipes**: Recipe management with nutritional data
- **meal_plans**: Meal planning and scheduling
- **ingredients**: Nutritional ingredient database
- **food_categories**: Food classification system
- **suggestions**: User and AI-generated suggestions
- **progress_tracking**: Health and nutrition progress data

## 🤖 AI Features

- **Intelligent Meal Planning**: AI generates personalized meal plans based on user preferences, dietary restrictions, and health goals
- **Recipe Recommendations**: Smart recipe suggestions based on user history and preferences
- **Nutritional Analysis**: AI-powered nutritional content analysis and optimization
- **Dietary Compliance**: Ensures meal plans meet specific dietary requirements (vegetarian, vegan, keto, etc.)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting for API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- SQL injection prevention

## 📱 User Interface

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Real-time Updates**: Dynamic content updates without page refreshes
- **Accessibility**: WCAG compliant design for better accessibility

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend linting
cd client
npm run lint
```

## 📈 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# Build backend
cd server
npm run build
```

### Docker Deployment (Optional)
```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **NutriPlan Pro Team** - Full-stack development and AI integration

## 🆘 Support

For support, email support@nutriplanpro.com or create an issue in the repository.

---

**NutriPlan Pro** - Making healthy eating simple and personalized with AI! 🎯


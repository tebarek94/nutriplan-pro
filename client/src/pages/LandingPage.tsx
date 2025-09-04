import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import { 
  Heart, 
  Utensils, 
  Brain, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Star,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Meal Planning',
      description: 'Our advanced AI analyzes your dietary preferences, health goals, and nutritional needs to create personalized meal plans that adapt to your lifestyle. Get intelligent recommendations that evolve with your progress.'
    },
    {
      icon: Utensils,
      title: 'Smart Recipe Discovery',
      description: 'Explore our curated collection of 10,000+ healthy recipes with detailed nutrition facts, cooking instructions, and user ratings. Filter by cuisine, dietary restrictions, cooking time, and difficulty level.'
    },
    {
      icon: Target,
      title: 'Precision Nutrition Tracking',
      description: 'Track your daily nutrition intake with our comprehensive analytics dashboard. Monitor calories, macros, vitamins, and minerals with detailed insights and progress visualization to stay on track with your health goals.'
    },
    {
      icon: Users,
      title: 'Vibrant Health Community',
      description: 'Connect with like-minded health enthusiasts, share your culinary creations, and discover new recipes from our growing community. Get inspired by success stories and expert nutrition advice.'
    }
  ];

  const benefits = [
    'Personalized nutrition recommendations based on your unique profile',
    'AI-generated meal plans that adapt to your schedule and preferences',
    'Comprehensive nutrition tracking with detailed macro and micronutrient analysis',
    'Recipe ratings, reviews, and community-driven recommendations',
    'Smart grocery list generation to streamline your shopping experience',
    'Cross-platform accessibility with seamless mobile and desktop sync'
  ];

  const stats = [
    {
      icon: Star,
      title: '4.9/5 Rating',
      subtitle: 'From 10,000+ verified users',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Users,
      title: '50,000+ Users',
      subtitle: 'Active health community',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: TrendingUp,
      title: '95% Success Rate',
      subtitle: 'Health goal achievement',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Shield,
      title: '100% Secure',
      subtitle: 'Data protection & privacy',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="relative px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">NutriPlan Pro</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle size="sm" />
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link 
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Transform Your Health with
            <span className="text-blue-600 dark:text-blue-400"> AI-Powered</span> Nutrition
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the future of personalized nutrition with our intelligent platform. Get AI-generated meal plans, discover healthy recipes, track your progress, and achieve your health goals with precision and ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              to="/recipes"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg px-8 py-4 rounded-lg font-medium transition-colors dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900"
            >
              Explore Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose NutriPlan Pro?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge artificial intelligence with evidence-based nutrition science to deliver personalized health solutions that adapt to your unique lifestyle and goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-left p-8 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Everything You Need for a Healthier Life
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                From intelligent meal planning to comprehensive nutrition tracking, we provide all the tools and insights you need to achieve your health and fitness goals with confidence and precision.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{stat.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{stat.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How NutriPlan Pro Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process to personalized nutrition success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create Your Profile</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tell us about your dietary preferences, health goals, allergies, and lifestyle. Our AI learns your unique needs to provide personalized recommendations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Get AI-Generated Plans</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive personalized meal plans and recipe suggestions tailored to your goals. Our AI continuously adapts based on your feedback and progress.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Track & Achieve</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your nutrition intake, track your progress, and celebrate your achievements. Join our community for support and motivation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Health Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of users who have already achieved their health goals with NutriPlan Pro. Start your personalized nutrition journey today and experience the power of AI-driven health optimization.
          </p>
          <Link 
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="bg-white hover:bg-gray-100 text-blue-600 text-lg px-8 py-4 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">NutriPlan Pro</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                AI-powered nutrition and meal planning platform designed to help you achieve your health goals with personalized, science-backed recommendations.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI Meal Planning</li>
                <li>Recipe Discovery</li>
                <li>Nutrition Tracking</li>
                <li>Health Analytics</li>
                <li>Community Support</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Twitter</li>
                <li>Facebook</li>
                <li>Instagram</li>
                <li>LinkedIn</li>
                <li>YouTube</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NutriPlan Pro. All rights reserved. | Empowering healthier lives through AI-driven nutrition.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

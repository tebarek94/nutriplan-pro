import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../hooks/user/useProgress';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Award,
  Trophy,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import Card from '../components/ui/Card';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface ProgressData {
  goalCompletion: number;
  streakDays: number;
  totalMealPlans: number;
  averageCalories: number;
  aiGeneratedPlans: number;
}

interface WeightData {
  currentWeight: number;
  targetWeight: number;
  progress: number;
}

interface NutritionData {
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dailyBreakdown: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string;
}

const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { getUserProgress, getWeightProgress, getNutritionTrends, getAchievements, loading, error } = useProgress();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [weightData, setWeightData] = useState<WeightData | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all progress data
        const [progress, weight, nutrition, achievementsData] = await Promise.all([
          getUserProgress(selectedPeriod),
          getWeightProgress(),
          getNutritionTrends(selectedPeriod),
          getAchievements()
        ]);

        if (progress) setProgressData(progress);
        if (weight) setWeightData(weight);
        if (nutrition) setNutritionData(nutrition);
        if (achievementsData) setAchievements(achievementsData);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      }
    };

    fetchAllData();
  }, [selectedPeriod, getUserProgress, getWeightProgress, getNutritionTrends, getAchievements]);

  const getWeightProgressPercentage = () => {
    if (!weightData) return 0;
    return weightData.progress;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getCurrentWeekCalories = () => {
    if (!nutritionData?.dailyBreakdown || nutritionData.dailyBreakdown.length === 0) return 0;
    return nutritionData.dailyBreakdown[nutritionData.dailyBreakdown.length - 1]?.calories || 0;
  };

  const getPreviousWeekCalories = () => {
    if (!nutritionData?.dailyBreakdown || nutritionData.dailyBreakdown.length < 2) return 0;
    return nutritionData.dailyBreakdown[nutritionData.dailyBreakdown.length - 2]?.calories || 0;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Progress Tracking</h1>
          <p className="text-blue-100">
            Monitor your nutrition journey and celebrate your achievements
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goal Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressData?.goalCompletion || 0}%</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressData?.streakDays || 0} days</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Meal Plans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressData?.totalMealPlans || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Calories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressData?.averageCalories || 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Weight Progress */}
        <Card title="Weight Progress" padding="md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-xl font-bold text-gray-900">{weightData?.currentWeight || 0} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Target Weight</p>
                <p className="text-xl font-bold text-gray-900">{weightData?.targetWeight || 0} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-xl font-bold text-blue-600">{getWeightProgressPercentage().toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${getWeightProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Nutrition Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calories Trend */}
          <Card title="Calories Trend" padding="md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {getCurrentWeekCalories()}
                    </span>
                    {getTrendIcon(getCurrentWeekCalories(), getPreviousWeekCalories())}
                  </div>
                </div>
                
                <div className="flex items-end space-x-1 h-32">
                  {nutritionData?.dailyBreakdown.map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-100 rounded-t"
                      style={{ 
                        height: `${(day.calories / 2500) * 100}%`,
                        backgroundColor: index === nutritionData.dailyBreakdown.length - 1 ? '#2563eb' : '#dbeafe'
                      }}
                    ></div>
                  ))}
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  {nutritionData?.dailyBreakdown.map((day, index) => (
                    <span key={index}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  ))}
                </div>
              </div>
          </Card>

          {/* Macros Trend */}
          <Card title="Macros Distribution" padding="md">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold">
                        {nutritionData?.averages.protein || 0}g
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Protein</p>
                    <p className="text-xs text-gray-500">Daily avg</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 font-bold">
                        {nutritionData?.averages.carbs || 0}g
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Carbs</p>
                    <p className="text-xs text-gray-500">Daily avg</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-600 font-bold">
                        {nutritionData?.averages.fat || 0}g
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Fat</p>
                    <p className="text-xs text-gray-500">Daily avg</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Protein Goal</span>
                    <span className="text-gray-900">150g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(((nutritionData?.averages.protein || 0) / 150) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Carbs Goal</span>
                    <span className="text-gray-900">250g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(((nutritionData?.averages.carbs || 0) / 250) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fat Goal</span>
                    <span className="text-gray-900">65g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(((nutritionData?.averages.fat || 0) / 65) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
          </Card>
        </div>

        {/* Achievements */}
        <Card title="Recent Achievements" padding="md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div key={achievement.id} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No achievements unlocked yet</p>
                  <p className="text-sm text-gray-400">Keep using the app to unlock achievements!</p>
                </div>
              )}
            </div>
        </Card>
             </div>
     </DashboardLayout>
   );
 };

export default ProgressPage;

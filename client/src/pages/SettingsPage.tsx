import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Moon, Sun, User, Bell, Shield, Palette } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const settingsSections = [
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          label: 'Theme',
          description: 'Choose between light and dark mode',
          action: (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {theme === 'light' ? 'Light' : 'Dark'}
              </span>
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </>
                )}
              </Button>
            </div>
          ),
        },
      ],
    },
    {
      title: 'Account',
      icon: User,
      items: [
        {
          label: 'Profile Information',
          description: 'Update your personal information',
          action: (
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          ),
        },
        {
          label: 'Email Preferences',
          description: 'Manage your email notifications',
          action: (
            <Button variant="outline" size="sm">
              Configure
            </Button>
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Push Notifications',
          description: 'Control push notification settings',
          action: (
            <Button variant="outline" size="sm">
              Settings
            </Button>
          ),
        },
        {
          label: 'Email Notifications',
          description: 'Manage email notification preferences',
          action: (
            <Button variant="outline" size="sm">
              Configure
            </Button>
          ),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Password',
          description: 'Change your account password',
          action: (
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          ),
        },
        {
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          action: (
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {settingsSections.map((section) => (
          <Card key={section.title}>
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <section.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              {section.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <div className="ml-4">{item.action}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Current Theme Preview */}
      <Card>
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Theme Preview
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Current Theme: {theme === 'light' ? 'Light' : 'Dark'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This is how your app currently looks with the {theme} theme.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Theme Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your theme preference is saved locally and will persist across sessions.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;

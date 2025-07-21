import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './button';


interface ThemeToggleProps {
  variant?: 'default' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const { theme, setTheme, actualTheme } = useTheme();

  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <div className="group">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-card border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-1" role="menu">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                  theme === 'light' ? 'bg-accent text-accent-foreground' : 'text-foreground'
                }`}
                role="menuitem"
              >
                <Sun className="mr-3 h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                  theme === 'dark' ? 'bg-accent text-accent-foreground' : 'text-foreground'
                }`}
                role="menuitem"
              >
                <Moon className="mr-3 h-4 w-4" />
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                  theme === 'system' ? 'bg-accent text-accent-foreground' : 'text-foreground'
                }`}
                role="menuitem"
              >
                <Monitor className="mr-3 h-4 w-4" />
                System
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simple toggle between light and dark
  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`relative ${className}`}
      aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

export default ThemeToggle;
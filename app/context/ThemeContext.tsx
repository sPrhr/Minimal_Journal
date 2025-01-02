import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
  isSystemTheme: boolean;
  setIsSystemTheme: (value: boolean) => void;
}

interface Theme {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
}

export const lightTheme: Theme = {
  background: '#ffffff',
  text: '#333333',
  primary: '#007AFF',
  secondary: '#34C759',
  border: '#eee',
};

export const darkTheme: Theme = {
  background: '#1a1a1a',
  text: '#ffffff',
  primary: '#0A84FF',
  secondary: '#32D74B',
  border: '#333',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);
  
  // Load saved preferences
  useEffect(() => {
    loadThemePreferences();
  }, []);

  // Follow system theme when isSystemTheme is true
  useEffect(() => {
    if (isSystemTheme && systemColorScheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, isSystemTheme]);

  const loadThemePreferences = async () => {
    try {
      const [savedTheme, savedIsSystem] = await Promise.all([
        AsyncStorage.getItem('isDarkMode'),
        AsyncStorage.getItem('isSystemTheme')
      ]);
      
      if (savedIsSystem !== null) {
        const useSystem = JSON.parse(savedIsSystem);
        setIsSystemTheme(useSystem);
        if (useSystem && systemColorScheme) {
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } else if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newThemeValue = !isDarkMode;
      setIsDarkMode(newThemeValue);
      setIsSystemTheme(false);
      await Promise.all([
        AsyncStorage.setItem('isDarkMode', JSON.stringify(newThemeValue)),
        AsyncStorage.setItem('isSystemTheme', JSON.stringify(false))
      ]);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleSetIsSystemTheme = async (value: boolean) => {
    try {
      setIsSystemTheme(value);
      if (value && systemColorScheme) {
        setIsDarkMode(systemColorScheme === 'dark');
      }
      await AsyncStorage.setItem('isSystemTheme', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving system theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      theme,
      isSystemTheme,
      setIsSystemTheme: handleSetIsSystemTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
// ThemeContext.js
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import {getTheme} from '../../configUtils/theme';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {lightColors, darkColors} from '../../configUtils/colors';

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof lightColors;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme from storage', error);
        setIsDarkMode(systemColorScheme === 'dark');
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme to storage', error);
    }
  };

  const theme = getTheme(isDarkMode);

  return (
    <ThemeContext.Provider value={{isDarkMode, toggleTheme, theme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

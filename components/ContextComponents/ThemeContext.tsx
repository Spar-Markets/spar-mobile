import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import { getTheme } from '../../configUtils/theme';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../../configUtils/colors';

interface ThemeContextProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    theme: typeof lightColors;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: {children: ReactNode}) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsDarkMode(systemColorScheme === 'dark');
    }, [systemColorScheme])

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    }

    const theme = getTheme(isDarkMode);

    return (
        <ThemeContext.Provider value={{isDarkMode, toggleTheme, theme,}}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context;
}
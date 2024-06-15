/**
 * Theme configuration for app
 * @author Joseph Quaratiello
 */

import { lightColors, darkColors } from "./colors";
import { DefaultTheme } from "@react-navigation/native";

type Theme = typeof lightColors;

export const getTheme = (isDarkMode: boolean) => {
    const colors = isDarkMode ? darkColors.colors : lightColors.colors;
    return {
        ...DefaultTheme,
        dark: isDarkMode,
        colors: {
            ...DefaultTheme.colors,
            ...colors
        }
    }
}
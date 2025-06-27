import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { darkTheme, lightTheme } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 'system', 'light', 'dark'
  const [mode, setMode] = useState('system');
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    let colorScheme = Appearance.getColorScheme();
    if (mode === 'system') {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    } else if (mode === 'dark') {
      setTheme(darkTheme);
    } else {
      setTheme(lightTheme);
    }
  }, [mode]);

  
  useEffect(() => {
    if (mode !== 'system') return;
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });
    return () => listener.remove();
  }, [mode]);

  useEffect(() => {
    const loadThemeMode = async () => {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode) setMode(savedMode);
    };
    loadThemeMode();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
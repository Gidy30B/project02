import React, { createContext, useState, useContext, useEffect } from "react";
import { Appearance, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


const LightTheme = {
  dark: false,
  colors: {
    background: "#ffffff",
    text: "#000000",
  },
};

const DarkTheme = {
  dark: true,
  colors: {
    background: "#f7f39a",
    text: "#ffffff",
  },
};

const ThemeContext = createContext({
  theme: LightTheme,
  toggleTheme: () => {},
  clearTheme: () => {},
});

export const ThemeProvider = ({ children }:any) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(systemColorScheme === "dark" ? DarkTheme : LightTheme);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("userTheme");
      if (savedTheme) {
        setTheme(savedTheme === "dark" ? DarkTheme : LightTheme);
      } else {
        setTheme(systemColorScheme === "dark" ? DarkTheme : LightTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === DarkTheme ? LightTheme : DarkTheme;
    setTheme(newTheme);
    await AsyncStorage.setItem("userTheme", newTheme.dark ? "dark" : "light");
  };

  const clearTheme = async () => {
    await AsyncStorage.removeItem("userTheme");
    setTheme(systemColorScheme === "dark" ? DarkTheme : LightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, clearTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
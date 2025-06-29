import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useTheme } from "../../contexts/ThemeContext";

const Settings = () => {
  const { mode, setMode, theme } = useTheme();

  const saveThemeMode = async (mode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode);
    } catch (e) {}
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <Header title="Ustawienia" showBackButton={true} />
      <View style={styles.container}>
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: theme.fonts.bold,
            marginBottom: 10,
          }}
        >
          Tryb kolorów:
        </Text>
        {["system", "light", "dark"].map((opt) => (
          <Pressable
            key={opt}
            onPress={() => {
              setMode(opt);
              saveThemeMode(opt);
            }}
            style={[
              styles.option,
              mode === opt && { backgroundColor: "rgba(29, 116, 122, 0.65)" },
            ]}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontWeight:
                  mode === opt ? theme.fonts.bold : theme.fonts.regular,
                fontSize: 16,
              }}
            >
              {opt === "system"
                ? "Systemowy"
                : opt === "light"
                ? "Jasny"
                : "Ciemny"}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScreenWrapper>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

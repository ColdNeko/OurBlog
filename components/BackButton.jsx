import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import Icon from "../assets/icons";
import { useTheme } from "../contexts/ThemeContext";

const BackButton = ({ size = 26 }) => {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => router.back()}
      style={[styles.button, { borderRadius: theme.radius.small }]}
    >
      <Icon
        name="arrowLeft"
        size={size}
        strokeWidth={2.5}
        color={theme.colors.text}
      />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
});

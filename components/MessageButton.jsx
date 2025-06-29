import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import Icon from "../assets/icons";
import { useTheme } from "../contexts/ThemeContext";

const MessageButton = ({ size = 26 }) => {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => router.push("messages")}
      style={[styles.button, { borderRadius: theme.radius.small }]}
    >
      <Icon
        name="sendMessage"
        size={size}
        strokeWidth={2.5}
        color={theme.colors.text}
      />
    </Pressable>
  );
};

export default MessageButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-end",
    padding: 5,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
});

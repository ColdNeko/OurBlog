import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage } from "../helpers/common";
import Loading from "./Loading";

const Button = ({
  buttonStyle,
  textStyle,
  title = "",
  onPress = () => {},
  loading = false,
  hasShadow = true,
}) => {
  const { theme } = useTheme();
  const shadowStyle = {
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  };

  if (loading) {
    return (
      <View
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.extraLarge,
          },
          buttonStyle,
        ]}
      >
        <Loading />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.extraLarge,
        },
        buttonStyle,
        hasShadow && shadowStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: "white", fontWeight: theme.fonts.bold },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    height: heightPercentage(6),
    borderCurve: "continuous",
  },
  text: {
    fontSize: heightPercentage(2.2),
  },
});

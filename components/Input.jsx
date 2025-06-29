import { StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage } from "../helpers/common";

const Input = (props) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        { borderColor: theme.colors.text, borderRadius: theme.radius.medium },
        props.containerStyle && props.containerStyle,
      ]}
    >
      {props.icon}
      <TextInput
        style={[
          { flex: 1, color: theme.colors.text },
          props.style && props.style,
        ]}
        placeholderTextColor={theme.colors.textLight}
        ref={props.inputRef && props.inputRef}
        {...props}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: heightPercentage(7),
    borderWidth: 0.5,
    paddingHorizontal: 15,
    justifyContent: "center",
    borderCurve: "continuous",
    gap: 12,
  },
});

import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage } from "../helpers/common";
import { getUserImageSource } from "../services/imageService";

const Avatar = ({ uri, size = heightPercentage(4.5), rounded, style = {} }) => {
  const { theme } = useTheme();
  const imageSource = getUserImageSource(uri);
  return (
    <Image
      source={imageSource}
      transition={100}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: rounded ?? theme.radius.medium,
          borderColor: theme.colors.darkLight,
        },
        style,
      ]}
    />
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    borderCurve: "continuous",
    borderWidth: 1,
  },
});

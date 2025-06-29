import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage } from "../helpers/common";
import BackButton from "./BackButton";
import MessageButton from "./MessageButton";

const Header = ({
  title,
  showBackButton = false,
  marginButton = 10,
  showMessageButton = false,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { marginBottom: marginButton }]}>
      {showBackButton && (
        <View style={styles.showBackButton}>
          <BackButton router={router} />
        </View>
      )}
      <Text
        style={[
          styles.title,
          { color: theme.colors.textDark, fontWeight: theme.fonts.medium },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {title || ""}
      </Text>
      {showMessageButton && (
        <View style={styles.showMessageButton}>
          <MessageButton />
        </View>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    gap: 10,
  },
  title: {
    fontSize: heightPercentage(2.5),
    maxWidth: "70%",
    textAlign: "center",
  },
  showBackButton: {
    position: "absolute",
    left: 10,
  },
  showMessageButton: {
    position: "absolute",
    right: 10,
  },
});

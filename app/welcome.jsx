import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
//prettier-ignore
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Button from "../components/Button";
import ScreenWrapper from "../components/ScreenWrapper";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../helpers/common";

const Welcome = () => {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar
        style={theme.colors.background === "#181818" ? "light" : "dark"}
      />
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Image
          style={styles.welcomeImage}
          resizeMode="contain"
          source={require("../assets/images/logo.png")}
        />
        <View style={{ gap: 30 }}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.text, fontWeight: theme.fonts.extraBold },
            ]}
          >
            OurBlogWall
          </Text>
          <Text
            style={[
              styles.subTitle,
              { color: theme.colors.text, fontWeight: theme.fonts.regular },
            ]}
          >
            A place where your Blog is part of Our Community
          </Text>
        </View>
        <View style={styles.footer}>
          <Button
            title="Zaloguj się"
            textStyle={{ color: "white" }}
            buttonStyle={{ marginHorizontal: widthPercentage(3) }}
            onPress={() => router.push("login")}
          />
          <View style={styles.bottomTextContainer}>
            <Text
              style={[
                styles.loginText,
                { color: theme.colors.text, fontWeight: theme.fonts.regular },
              ]}
            >
              Nie masz konta?
            </Text>
            <Pressable onPress={() => router.push("register")}>
              <Text
                style={[
                  styles.loginButton,
                  { color: theme.colors.primary, fontWeight: theme.fonts.bold },
                ]}
              >
                Zarejestruj się.
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: widthPercentage(4),
  },
  welcomeImage: {
    width: widthPercentage(100),
    height: widthPercentage(50),
    alignSelf: "center",
  },
  title: {
    fontSize: heightPercentage(4),
    textAlign: "center",
  },
  subTitle: {
    fontSize: heightPercentage(1.7),
    textAlign: "center",

    marginBottom: 20,
  },
  footer: {
    gap: 30,
    width: "100%",
  },
  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  loginText: {
    fontSize: heightPercentage(2),
  },
  loginButton: {
    fontSize: heightPercentage(2),
  },
});

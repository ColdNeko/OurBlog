import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../assets/icons";
import Button from "../components/Button";
import Input from "../components/Input";
import ScreenWrapper from "../components/ScreenWrapper";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../helpers/common";
import { supabase } from "../lib/supabase";

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      alert("Wypełnij wszystkie pola");
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    console.log("error: ", error);
    if (error) {
      alert(error.message);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar
        style={theme.colors.background === "#181818" ? "light" : "dark"}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "top",
          paddingHorizontal: widthPercentage(5),
        }}
      >
        <View
          style={{
            height: "20%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="logo"
            size={heightPercentage(32)}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.welcomeText,
              { color: theme.colors.text, fontWeight: theme.fonts.bold },
            ]}
          >
            Zaloguj się!
          </Text>
        </View>

        <View style={styles.form}>
          <Text
            style={{
              fontSize: heightPercentage(1.5),
              color: theme.colors.text,
            }}
          >
            Podaj login i hasło
          </Text>
          <Input
            placeholder="Podaj adres Email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            placeholder="Podaj hasło"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <View style={{ alignItems: "center" }}>
            <Pressable
              onPress={() =>
                Alert.alert(
                  "To musisz sobie przypomnieć, bo nie ma jeszcze takiej funkcji 😅"
                )
              }
            >
              <Text style={{ color: theme.colors.primary }}>
                Nie pamiętasz hasła?
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={{ marginTop: heightPercentage(20) }}>
          <Button title="Zaloguj" loading={loading} onPress={onSubmit} />
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: theme.colors.text,
            }}
          >
            Nie masz konta?{" "}
            <Text
              style={{ color: theme.colors.primary }}
              onPress={() => router.push("register")}
            >
              Zarejestruj się
            </Text>
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: widthPercentage(5),
  },
  welcomeText: {
    fontSize: heightPercentage(4),
  },
  form: {
    gap: 15,
    marginTop: heightPercentage(5),
  },
});

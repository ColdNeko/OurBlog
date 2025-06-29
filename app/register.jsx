import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
//prettier-ignore
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from "../assets/icons";
import Button from "../components/Button";
import Input from "../components/Input";
import ScreenWrapper from "../components/ScreenWrapper";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../helpers/common";
import { supabase } from "../lib/supabase";

const Register = () => {
  const router = useRouter();
  const nameRef = useRef("");
  const emailRef = useRef("");
  const emailVALRef = useRef("");
  const passwordRef = useRef("");
  const passwordVALRef = useRef("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const onSubmit = async () => {
    if (
      !emailRef.current ||
      !passwordRef.current ||
      !nameRef.current ||
      !emailVALRef.current ||
      !passwordVALRef.current
    ) {
      alert("Wypełnij wszystkie pola");
      return;
    }

    if (emailRef.current !== emailVALRef.current) {
      alert("Emaile nie są takie same");
      return;
    }

    if (passwordRef.current !== passwordVALRef.current) {
      alert("Hasła nie są takie same");
      return;
    }

    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    setLoading(false);

    console.log("session: ", session);
    console.log("error: ", error);
    if (error) {
      Alert.alert("Błąd rejestracji", error.message);
      setLoading(false);
      return;
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar
        style={theme.colors.background === "#181818" ? "light" : "dark"}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Icon
              name="logo"
              size={42}
              strokeWidth={2}
              color={theme.colors.primary}
            />
          </View>
          <View>
            <Text
              style={[
                styles.welcomeText,
                {
                  color: theme.colors.text,
                  fontWeight: theme.fonts.bold,
                  color: theme.colors.text,
                },
              ]}
            >
              Stwórz Konto
            </Text>
          </View>

          <View style={[styles.form, { color: theme.colors.text }]}>
            <Input
              placeholder="Podaj imię i nazwisko"
              onChangeText={(value) => (nameRef.current = value)}
            />
            <Input
              placeholder="Wpisz e-mail"
              onChangeText={(value) => (emailRef.current = value)}
            />
            <Input
              placeholder="Powtórz e-mail"
              onChangeText={(value) => (emailVALRef.current = value)}
            />
            <Input
              placeholder="Wpisz hasło"
              secureTextEntry
              onChangeText={(value) => (passwordRef.current = value)}
            />
            <Input
              placeholder="Powtórz hasło"
              secureTextEntry
              onChangeText={(value) => (passwordVALRef.current = value)}
            />
            <Button
              buttonStyle={{ marginTop: 25 }}
              title="Zarejestruj"
              loading={loading}
              onPress={onSubmit}
            />
            <View>
              <Text style={{ textAlign: "center", color: theme.colors.text }}>
                Masz już konto?{" "}
                <Text
                  style={{ color: theme.colors.primary }}
                  onPress={() => router.push("login")}
                >
                  Zaloguj się
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: widthPercentage(2),
  },
  welcomeText: {
    fontSize: heightPercentage(4),
    marginBottom: 40,
  },
  form: {
    gap: 17.5,
  },
});

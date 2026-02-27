import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Icon from "../../assets/icons";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../../helpers/common";
import { getUserImageSource, uploadFile } from "../../services/imageService";
import { updateUser } from "../../services/userService";

const EditProfile = () => {
  const { user: currentUser, setUserData } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState({
    name: "",
    phoneNumber: "",
    image: "",
    bio: "",
    birthdate: "",
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        phoneNumber: currentUser.phoneNumber || "",
        image: currentUser.image || "",
        bio: currentUser.bio || "",
        birthdate: currentUser.birthdate || "",
      });
    }
  }, [currentUser]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setUser({ ...user, image: result.assets[0].uri });
    }
  };

  const validateBirthdate = (birthdate) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(birthdate)) {
      return false;
    }
    const date = new Date(birthdate);
    const timestamp = date.getTime();
    if (typeof timestamp !== "number" || Number.isNaN(timestamp)) {
      return false;
    }
    return date.toISOString().startsWith(birthdate);
  };

  const validatePhoneNumber = (phoneNumber) => {
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(phoneNumber);
  };

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, phoneNumber, bio, image, birthdate } = userData;
    if (!name || !phoneNumber || !bio || !birthdate || !image) {
      alert("Wypełnij wszystkie pola");
      return;
    }

    if (!validateBirthdate(birthdate)) {
      alert(
        "Podaj datę urodzenia w formacie YYYY-MM-DD i upewnij się, że jest poprawna",
      );
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      alert("Podaj poprawny numer telefonu");
      return;
    }

    setLoading(true);

    if (typeof image === "string" && image.startsWith("file://")) {
      let imageRes = await uploadFile("profiles", image, true);
      if (imageRes.success) {
        userData.image = imageRes.data;
        setUser({ ...user, image: getUserImageSource(imageRes.data).uri });
      } else {
        userData.image = null;
      }
    }

    const res = await updateUser(currentUser?.id, userData);
    setLoading(false);
    console.log("res: ", res);

    if (res.success) {
      setUserData({ ...currentUser, ...userData });
      router.back();
    }
  };

  let imageSource =
    user.image && user.image.startsWith("file://")
      ? { uri: user.image }
      : getUserImageSource(user.image);

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <ScrollView style={{ flex: 1 }}>
            <Header title="Edytuj Profil" showBackButton={true} />
            <View style={styles.form}>
              <View style={styles.avatarContainer}>
                <Pressable
                  onPress={() => setIsImagePreviewVisible(true)}
                  style={styles.avatarPressable}
                >
                  <Image
                    source={imageSource}
                    style={[
                      styles.avatar,
                      {
                        borderRadius: theme.radius.extraLarge * 1.8,
                        borderColor: theme.colors.darkLight,
                      },
                    ]}
                  />
                </Pressable>
                <Pressable
                  style={[
                    styles.cameraIcon,
                    {
                      backgroundColor: theme.colors.background,
                      shadowColor: theme.colors.dark,
                    },
                  ]}
                  onPress={onPickImage}
                >
                  <Icon
                    name="camera"
                    size={46}
                    strokeWidth={2.1}
                    color={theme.colors.text}
                  />
                </Pressable>
              </View>
              <Input
                icon={
                  <Icon
                    name="user"
                    size={heightPercentage(2.5)}
                    color={theme.colors.textDark}
                    strokeWidth={2.3}
                  />
                }
                placeholder="Podaj imię i nazwisko"
                value={user.name}
                onChangeText={(value) => setUser({ ...user, name: value })}
              />
              <Input
                icon={
                  <Icon
                    name="phone"
                    size={heightPercentage(2.5)}
                    color={theme.colors.textDark}
                    strokeWidth={2.3}
                  />
                }
                placeholder="Podaj numer telefonu"
                value={user.phoneNumber}
                onChangeText={(value) =>
                  setUser({ ...user, phoneNumber: value })
                }
              />
              <Input
                icon={
                  <Icon
                    name="cake"
                    size={heightPercentage(2.5)}
                    color={theme.colors.textDark}
                    strokeWidth={2.3}
                  />
                }
                placeholder="Podaj datę urodzenia"
                value={user.birthdate}
                onChangeText={(value) => setUser({ ...user, birthdate: value })}
              />
              <Input
                placeholder="Opis profilu"
                value={user.bio}
                multiline={true}
                containerStyle={styles.bio}
                onChangeText={(value) => setUser({ ...user, bio: value })}
              />
              <Button
                title="Zaktualizuj dane"
                loading={loading}
                onPress={onSubmit}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <Modal
        visible={isImagePreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImagePreviewVisible(false)}
      >
        <Pressable
          style={styles.imagePreviewOverlay}
          onPress={() => setIsImagePreviewVisible(false)}
        >
          <Image
            source={imageSource}
            style={styles.imagePreview}
            contentFit="contain"
          />
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: widthPercentage(4),
  },
  avatarContainer: {
    height: widthPercentage(45),
    width: widthPercentage(45),
    alignSelf: "center",
  },
  avatarPressable: {
    borderRadius: 999,
  },
  avatar: {
    height: "100%",
    width: "100%",
    borderCurve: "continuous",
    borderWidth: 1,
  },
  cameraIcon: {
    position: "absolute",
    bottom: -5,
    right: -5,
    padding: 8,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  form: {
    gap: 18,
    marginTop: 20,
  },
  input: {
    flexDirection: "row",
    borderWidth: 0.5,
    borderCurve: "continuous",
    paddingHorizontal: 15,
    gap: 12,
  },
  bio: {
    flexDirection: "row",
    height: heightPercentage(15),
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
});

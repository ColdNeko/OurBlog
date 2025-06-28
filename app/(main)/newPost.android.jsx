import { Video } from "expo-av";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
//prettier-ignore
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Icon from "../../assets/icons";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button";
import Header from "../../components/Header";
import RichTextEditor from "../../components/RichTextEditor";
import ScreenWrapper from "../../components/ScreenWrapper";
//import { theme } from '../../constants/theme';
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../../helpers/common";
import { getSupabaseFileUrl } from "../../services/imageService";
import { createOrUpdatePost } from "../../services/postService";

const NewPost = () => {
  const { theme } = useTheme();
  const post = useLocalSearchParams();
  // console.log('post: ', post);
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (post && post.id) {
      bodyRef.current = post.body;
      setFile(post.file || null);
      setTimeout(() => {
        editorRef.current?.setContentHTML(post.body);
      }, 300);
    }
  }, []);

  const onPick = async (isImage) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: isImage
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const isLocalFile = (file) => {
    if (!file) return null;
    if (typeof file == "object") return true;
    return false;
  };

  const getFileType = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.type;
    }

    if (file.includes("postImages")) {
      return "image";
    }
    return "video";
  };

  const getFileUri = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }
    return getSupabaseFileUrl(file)?.uri;
  };

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      alert("Post musi zawierać treść lub załącznik");
      return;
    }

    let data = {
      file,
      body: bodyRef.current,
      userId: user?.id,
    };

    if (post && post.id) {
      data.id = post.id;
    }

    setLoading(true);
    let res = await createOrUpdatePost(data);
    setLoading(false);
    if (res.success) {
      setFile(null);
      bodyRef.current = "";
      editorRef.current?.setContentHTML("");
      router.back();
    } else {
      alert(res.message);
    }
  };

  console.log(
    "file:",
    file,
    "typeof file:",
    typeof file,
    "uri:",
    getFileUri(file),
    "type:",
    getFileType(file)
  );

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Header title="Nowy post" showBackButton={true} />
            <ScrollView contentContainerStyle={{ gap: 20 }}>
              <View style={styles.header}>
                <Avatar
                  uri={user?.image}
                  size={heightPercentage(5)}
                  rounded={theme.radius.extraLarge}
                  style={styles.avatar}
                />
                <View style={{ gap: 2 }}>
                  <Text style={[styles.username, { color: theme.colors.text }]}>
                    {user?.name}
                  </Text>
                  <Text
                    style={[styles.publicText, { color: theme.colors.text }]}
                  >
                    Publiczny
                  </Text>
                </View>
              </View>

              <View style={styles.textEditor}>
                <RichTextEditor
                  ref={editorRef}
                  onChange={(body) => (bodyRef.current = body)}
                />
              </View>

              {file &&
                typeof getFileUri(file) === "string" &&
                !!getFileUri(file) &&
                getFileType(file) === "image" && (
                  <View style={styles.file}>
                    <Image
                      source={[{ uri: getFileUri(file) }]}
                      resizeMode="cover"
                      style={{ flex: 1 }}
                    />
                    <Pressable
                      style={styles.closeIcon}
                      onPress={() => setFile(null)}
                    >
                      <Icon
                        name="close"
                        size={heightPercentage(3)}
                        color={theme.colors.text}
                        style={styles.imageIcon}
                      />
                    </Pressable>
                  </View>
                )}
              {file &&
                typeof getFileUri(file) === "string" &&
                !!getFileUri(file) &&
                getFileType(file) === "video" && (
                  <View style={styles.file}>
                    <Video
                      style={styles.video}
                      source={{ uri: getFileUri(file) }}
                      useNativeControls
                      resizeMode="cover"
                      isLooping
                    />
                    <Pressable
                      style={styles.closeIcon}
                      onPress={() => setFile(null)}
                    >
                      <Icon
                        name="close"
                        size={heightPercentage(3)}
                        color={theme.colors.text}
                        style={styles.imageIcon}
                      />
                    </Pressable>
                  </View>
                )}

              <View style={[styles.media, { borderColor: theme.colors.text }]}>
                <Text
                  style={[styles.addImageText, { color: theme.colors.text }]}
                >
                  Dodaj załącznik do posta
                </Text>
                <View style={styles.mediaIcons}>
                  <TouchableOpacity onPress={() => onPick(true)}>
                    <Icon
                      name="album"
                      size={heightPercentage(3)}
                      color={theme.colors.text}
                      style={styles.imageIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onPick(false)}>
                    <Icon
                      name="video"
                      size={heightPercentage(3)}
                      color={theme.colors.text}
                      style={styles.imageIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            <Button
              title={post && post.id ? "Zapisz zmiany" : "Opublikuj"}
              loading={loading}
              onPress={onSubmit}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: widthPercentage(4),
    gap: 15,
  },
  title: {
    fontSize: heightPercentage(3),

    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: heightPercentage(2.5),
  },
  avatar: {
    height: heightPercentage(5),
    width: heightPercentage(5),

    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  publicText: {
    fontSize: heightPercentage(1.5),
  },
  textEditor: {
    marginBottom: 45,
  },
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 15,

    borderCurve: "continuous",
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addImageText: {
    fontSize: heightPercentage(2.5),
  },
  imageIcon: {},
  file: {
    height: heightPercentage(20),
    width: "100%",

    borderCurve: "continuous",
    overflow: "hidden",
  },
  video: {
    flex: 1,
  },
  closeIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255,0,0,0.5)",
    padding: 5,
    borderRadius: 15,
    zIndex: 1,
  },
});

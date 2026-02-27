import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage } from "../helpers/common";
import { getUserImageSource } from "../services/imageService";

const Avatar = ({
  uri,
  size = heightPercentage(4.5),
  rounded,
  style = {},
  enablePreview = false,
}) => {
  const { theme } = useTheme();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const imageSource = getUserImageSource(uri);
  const avatarImage = (
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

  if (!enablePreview) {
    return avatarImage;
  }

  return (
    <>
      <Pressable onPress={() => setIsPreviewVisible(true)}>
        {avatarImage}
      </Pressable>
      <Modal
        visible={isPreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <Pressable
          style={styles.previewOverlay}
          onPress={() => setIsPreviewVisible(false)}
        >
          <Image
            source={imageSource}
            style={styles.previewImage}
            contentFit="contain"
          />
        </Pressable>
      </Modal>
    </>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    borderCurve: "continuous",
    borderWidth: 1,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
});

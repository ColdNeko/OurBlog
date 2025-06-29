import { Video } from "expo-av";
import { Image } from "expo-image";
import moment from "moment";
import "moment/locale/pl";
import { useEffect, useState } from "react";
//prettier-ignore
import { Alert, Pressable, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RenderHTML from "react-native-render-html";
import Icon from "../assets/icons";
import { useTheme } from "../contexts/ThemeContext";
//prettier-ignore
import { heightPercentage, stripHtmlTags, widthPercentage } from "../helpers/common";
import { downloadFile, getSupabaseFileUrl } from "../services/imageService";
import { createNotification } from "../services/notificationService";
import { createPostLike, removePostLike } from "../services/postService";
import Avatar from "./Avatar";
import Loading from "./Loading";

moment.locale("pl");

const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreButton = true,
  showDeleteButton = false,
  onDelete = () => {},
  onEdit = () => {},
  menuVisible,
  onMenuOpen,
  onMenuClose,
  showMenu = false,
  gridMode = false,
}) => {
  const { theme } = useTheme();
  const [likes, setLikes] = useState(item?.postLikes || []);
  const [loading, setLoading] = useState(false);

  const shadowStyles = hasShadow
    ? {
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 1,
      }
    : {};

  const openPostDetails = () => {
    if (!showMoreButton) return null;
    router.push({ pathname: "postDetails", params: { postId: item?.id } });
  };

  const createdAt = moment(item.created_at);
  let displayDate;

  if (moment().isSame(createdAt, "day")) {
    displayDate = `Dzisiaj o ${createdAt.format("HH:mm")}`;
  } else if (moment().subtract(1, "days").isSame(createdAt, "day")) {
    displayDate = `Wczoraj o ${createdAt.format("HH:mm")}`;
  } else {
    displayDate = createdAt
      .format("D MMMM")
      .replace(
        / ([a-ząćęłńóśźż])/i,
        (m) => " " + m[1].toUpperCase() + m.slice(2)
      );
  }

  const onLike = async () => {
    if (liked) {
      let updatedLikes = likes.filter((like) => like.userId != currentUser?.id);
      setLikes([...updatedLikes]);
      let res = await removePostLike(item?.id, currentUser?.id);
      if (!res.success) {
        alert("Nie udało się usunąć polubienia posta");
      }
    } else {
      let data = {
        postId: item?.id,
        userId: currentUser?.id,
      };
      setLikes([...likes, data]);
      let res = await createPostLike(data);
      if (!res.success) {
        alert("Nie udało się polubić posta");
      } else {
        const isDuplicate = likes.some(
          (like) => like.userId == currentUser?.id
        );
        if (!isDuplicate && currentUser.id !== item.userId) {
          let notificationData = {
            senderId: currentUser.id,
            receiverId: item.userId,
            title: "Polubił twój post",
            data: JSON.stringify({ postId: item.id }),
          };
          createNotification(notificationData);
        }
      }
    }
  };

  const onShare = async () => {
    let content = { message: stripHtmlTags(item?.body) };
    if (item?.file) {
      setLoading(true);
      let url = await downloadFile(getSupabaseFileUrl(item?.file).uri);
      setLoading(false);
      content.url = url;
    }
    Share.share(content);
  };

  const handlePostDelete = () => {
    Alert.alert("Usuń Post", "Czy na pewno chcesz usunąć ten post?", [
      {
        text: "Usuń",
        onPress: () => onDelete(item),
        style: "destructive",
      },
      {
        text: "Anuluj",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
    ]);
  };

  useEffect(() => {
    setLikes(item?.postLikes || []);
  }, [item]);

  const liked =
    Array.isArray(likes) &&
    likes.some((like) => like.userId == currentUser?.id);
  const isAuthor = currentUser?.id === item?.userId;
  const isAdmin = currentUser?.isAdmin == true;

  const textStyles = {
    color: theme.colors.dark,
    fontSize: heightPercentage(1.7),
  };
  const tagsStyles = {
    div: textStyles,
    p: textStyles,
    ol: textStyles,
  };

  if (gridMode) {
    return (
      <TouchableOpacity onPress={openPostDetails}>
        <View
          style={[
            styles.gridSquare,
            {
              backgroundColor: theme.colors.gray,
              borderRadius: theme.radius.large,
            },
          ]}
        >
          {item?.file && item?.file?.includes("postImages") ? (
            <Image
              source={getSupabaseFileUrl(item?.file)}
              style={styles.gridImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.gridTextWrapper}>
              <Text
                style={[styles.gridText, { color: theme.colors.text }]}
                numberOfLines={6}
              >
                {stripHtmlTags(item.body)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={openPostDetails}>
      <View
        style={[
          styles.container,
          {
            borderRadius: theme.radius.extraLarge * 1.1,
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.darkLight,
            shadowColor: theme.colors.shadow || "black",
          },
          hasShadow && shadowStyles,
        ]}
      >
        <View style={styles.header}>
          <Pressable
            style={[
              styles.userInfo,
              { flexDirection: "row", alignItems: "center", gap: 8 },
            ]}
            onPress={() => {
              if (currentUser?.id === item.userId) {
                router.push("profile");
              } else {
                router.push({
                  pathname: "profile_others",
                  params: { userId: item.userId },
                });
              }
            }}
          >
            <Avatar
              uri={item.user?.image}
              size={heightPercentage(5)}
              rounded={theme.radius.extraLarge}
            />
            <View style={{ gap: 2 }}>
              <Text
                style={[
                  styles.username,
                  { color: theme.colors.text, fontWeight: theme.fonts.medium },
                ]}
              >
                {item.user?.name}
              </Text>
              <Text
                style={[
                  styles.postTime,
                  {
                    color: theme.colors.textLight,
                    fontWeight: theme.fonts.medium,
                  },
                ]}
              >
                {displayDate}
              </Text>
            </View>
          </Pressable>

          {/* MENU IKONA */}
          {(isAdmin || (isAuthor && showMenu)) && showMenu && (
            <View style={styles.menuWrapper} pointerEvents="box-none">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  menuVisible ? onMenuClose() : onMenuOpen();
                }}
              >
                <Icon
                  name="moreHorizontal"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.postBody}>
            {item.body && (
              <RenderHTML
                contentWidth={widthPercentage(100)}
                source={{ html: item.body }}
                tagsStyles={tagsStyles}
              />
            )}
          </View>
          {item?.file && item?.file?.includes("postImages") && (
            <Image
              source={getSupabaseFileUrl(item?.file)}
              transition={100}
              style={[
                styles.poshtMedia,
                { borderRadius: theme.radius.extraLarge },
              ]}
              contentFit="cover"
            />
          )}
          {item?.file && item?.file?.includes("postVideos") && (
            <Video
              source={getSupabaseFileUrl(item?.file)}
              transition={100}
              style={[
                styles.poshtMedia,
                {
                  height: heightPercentage(20),
                  borderRadius: theme.radius.extraLarge,
                },
              ]}
              resizeMode="cover"
              useNativeControls
              isLooping
            />
          )}
        </View>
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={onLike}>
              <Icon
                name="heart"
                size={heightPercentage(3)}
                fill={liked ? theme.colors.rose : "transparent"}
                strokeWidth={2}
                color={liked ? theme.colors.rose : theme.colors.textLight}
              />
            </TouchableOpacity>
            <Text style={[styles.count, { color: theme.colors.text }]}>
              {likes?.length}
            </Text>
          </View>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={openPostDetails}>
              <Icon
                name="comment"
                size={heightPercentage(3)}
                strokeWidth={2}
                color={theme.colors.textLight}
              />
            </TouchableOpacity>
            <Text style={[styles.count, { color: theme.colors.text }]}>
              {item?.comments[0]?.count}
            </Text>
          </View>
          <View style={styles.footerButton}>
            {loading ? (
              <Loading size="small" />
            ) : (
              <TouchableOpacity onPress={onShare}>
                <Icon
                  name="share"
                  size={heightPercentage(3)}
                  strokeWidth={2}
                  color={theme.colors.textLight}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* MENU I OVERLAY */}
        {menuVisible && (isAdmin || isAuthor) && (
          <>
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={onMenuClose}
            />
            <View
              style={[
                styles.menu,
                {
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.radius.large,
                  shadowColor: theme.colors.shadow || "#000",
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onMenuClose();
                  handlePostDelete();
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    color: theme.colors.text,
                  }}
                >
                  <Icon name="close" color={theme.colors.text} />
                  <Text style={[styles.menuText, { color: theme.colors.text }]}>
                    {" "}
                    Usuń
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onMenuClose();
                  onEdit(item);
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    color: theme.colors.text,
                  }}
                >
                  <Icon name="edit" color={theme.colors.text} />
                  <Text style={[styles.menuText, { color: theme.colors.text }]}>
                    {" "}
                    Edytuj
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 20,
    borderCurve: "continuous",
    padding: 15,
    borderWidth: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: heightPercentage(1.7),
  },
  postTime: {
    fontSize: heightPercentage(1.5),
  },
  content: {
    gap: 10,
  },
  poshtMedia: {
    height: heightPercentage(20),
    width: "100%",
    borderCurve: "continuous",
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  count: {
    fontSize: heightPercentage(1.5),
  },
  menuWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
  },
  menuOverlay: {
    position: "absolute",
    top: -40,
    left: -1000,
    right: -1000,
    bottom: -1000,
    width: "3000%",
    height: "3000%",
    backgroundColor: "rgba(0,0,0,0.01)",
    zIndex: 1,
  },
  menu: {
    position: "absolute",
    top: 40,
    right: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  menuItem: {
    paddingVertical: 8,
    flexDirection: "row",
  },
  menuText: {
    fontSize: 16,
  },
  gridSquare: {
    aspectRatio: 1,
    width: "100%",
    overflow: "hidden",

    justifyContent: "center",
    alignItems: "center",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridTextWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  gridText: {
    fontSize: 14,

    textAlign: "center",
  },
});

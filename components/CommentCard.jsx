import { router } from "expo-router";
import moment from "moment";
import "moment/locale/pl";
import { useEffect, useState } from "react";
//prettier-ignore
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import Icon from "../assets/icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage } from "../helpers/common";
import { createNotification } from "../services/notificationService";
//prettier-ignore
import { createCommentLike, fetchCommentLikes, removeCommentLike } from "../services/postService";
import Avatar from "./Avatar";

moment.locale("pl");
const CommentCard = ({
  isAdmin = false,
  item,
  deletable = false,
  onDelete = () => {},
  higlight = false,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const createdAt = moment(item?.created_at);
  let displayDate;

  if (moment().isSame(createdAt, "day")) {
    displayDate = `Dzisiaj o ${createdAt.format("HH:mm")}`;
  } else if (moment().subtract(1, "days").isSame(createdAt, "day")) {
    displayDate = `Wczoraj o ${createdAt.format("HH:mm")}`;
  } else {
    displayDate = createdAt.format("DD-MMMM");
  }

  const handleDelete = () => {
    Alert.alert("Usuń komentarz", "Czy na pewno chcesz usunąć ten komentarz?", [
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

  const handleProfilePress = () => {
    if (!router) return;
    if (user?.id === item.userId) {
      router.push("profile");
    } else {
      router.push({
        pathname: "profile_others",
        params: { userId: item.userId },
      });
    }
  };

  const [likes, setLikes] = useState(item?.commentLikes || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLikes = async () => {
      let res = await fetchCommentLikes(item.id);
      if (res.success) setLikes(res.data);
    };
    loadLikes();
  }, [item]);

  const liked =
    Array.isArray(likes) && likes.some((like) => like.userId == user?.id);
  //console.log('liked:', liked, 'currentUser:', user, 'likes:', likes);

  const onLike = async () => {
    if (!user?.id) return;
    setLoading(true);
    if (liked) {
      setLikes(likes.filter((like) => like.userId !== user.id));
      await removeCommentLike(item.id, user.id);
    } else {
      let data = {
        commentId: item.id,
        postId: item.postId,
        userId: user.id,
      };
      setLikes([...likes, data]);
      let res = await createCommentLike(data);
      if (!res.success) {
        alert("Nie udało się polubić komentarza");
      } else {
        const isDuplicate = likes.some((like) => like.userId == user?.id);
        if (!isDuplicate && user.id !== item.userId) {
          let notificationData = {
            senderId: user.id,
            receiverId: item.userId,
            title: "Polubił twój komentarz",
            data: JSON.stringify({ postId: item.id }),
          };
          createNotification(notificationData);
        }
      }
    }
    setLoading(false);
  };
  return (
    <View style={styles.container}>
      <Pressable onPress={handleProfilePress}>
        <Avatar uri={item?.user?.image} />
      </Pressable>
      <View
        style={[
          styles.content,
          { borderRadius: theme.radius.small },
          higlight && [
            styles.higlight,
            {
              shadowColor: theme.colors.dark,
              backgroundColor: "rgba(2, 155, 182, 0.3)",
            },
          ],
        ]}
      >
        <View style={styles.nameRow}>
          <Pressable onPress={handleProfilePress}>
            <Text
              style={[
                styles.text,
                {
                  fontWeight: theme.fonts.medium,
                  color: theme.colors.textDark,
                  flexShrink: 1,
                  marginRight: 8,
                  maxWidth: 120,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.user?.name}
            </Text>
          </Pressable>
          <Text
            style={[
              styles.text,
              {
                color: theme.colors.textLight,
                fontWeight: theme.fonts.medium,
                textAlign: "right",
                flexShrink: 0,
                maxWidth: 90,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayDate}
          </Text>
          {(isAdmin || deletable) && (
            <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 8 }}>
              <Icon name="close" color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
        <Text
          style={[
            styles.text,
            { fontWeight: theme.fonts.medium, color: theme.colors.textDark },
          ]}
        >
          {item?.text}
        </Text>
        <View style={styles.footerButton}>
          <TouchableOpacity
            onPress={onLike}
            disabled={loading}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Icon
              name="heart"
              size={heightPercentage(3)}
              color={liked ? theme.colors.rose : theme.colors.textLight}
              fill={liked ? theme.colors.rose : "transparent"}
              strokeWidth={2}
            />
            <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
              {likes.length}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CommentCard;

const styles = StyleSheet.create({
  text: {
    fontSize: heightPercentage(1.5),
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    minWidth: 0,
  },
  higlight: {
    borderWidth: 0.2,
  },
  content: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    flex: 1,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 7,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

import moment from "moment";
import "moment/locale/pl";
//prettier-ignore
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage } from "../helpers/common";
import { removeNotification } from "../services/notificationService";
import Avatar from "./Avatar";

moment.locale("pl");

const NotificationCard = ({ item, router, onRemove }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    let { postId, commentId } = JSON.parse(item?.data);
    router.push({ pathname: "postDetails", params: { postId, commentId } });
    onDeleteNotification(item);
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

  const onDeleteNotification = async (notification) => {
    if (!notification?.id) {
      console.log("Notification ID is missing");
      return;
    }
    let res = await removeNotification(notification?.id);
    if (res.success) {
      console.log("Notification deleted successfully");
      onRemove?.(notification.id);
    } else {
      Alert.alert("Błąd", res.message || "Nie udało się usunąć komentarza");
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.darkLight,
          borderRadius: theme.radius.extraLarge,
        },
      ]}
      onPress={handlePress}
    >
      <Avatar uri={item?.sender?.image} size={heightPercentage(5)} />
      <View style={styles.nameTitle}>
        <Text
          style={[
            styles.text,
            { fontWeight: theme.fonts.medium, color: theme.colors.text },
          ]}
        >
          {item?.sender?.name}
        </Text>
        <Text
          style={[
            styles.text,
            { fontWeight: theme.fonts.medium, color: theme.colors.text },
          ]}
        >
          {item?.title}
        </Text>
      </View>
      <Text style={[styles.text, { color: theme.colors.textLight }]}>
        {displayDate}
      </Text>
    </TouchableOpacity>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,

    borderWidth: 0.5,
    padding: 15,
    borderCurve: "continuous",
  },
  nameTitle: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: heightPercentage(1.6),
  },
});

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import NotificationCard from "../../components/NotificationCard";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../../helpers/common";
import { fetchNotification } from "../../services/notificationService";

const Notifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      getNotifications();
    }
  }, [user]);

  const getNotifications = async () => {
    let res = await fetchNotification(user.id);
    if (res.success) {
      setNotifications(res.data);
    }
  };

  const removeNotificationLocal = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.container}>
        <Header title="Powiadomienia" showBackButton={true} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.listStyle}
        >
          {notifications.map((item) => (
            <NotificationCard
              item={item}
              key={item?.id}
              router={router}
              onRemove={removeNotificationLocal}
            />
          ))}
          {notifications.length === 0 && (
            <Text style={[styles.noData, { color: theme.colors.text }]}>
              Brak powiadomień
            </Text>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: widthPercentage(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noData: {
    fontSize: heightPercentage(2.5),
    fontWeight: "500",
    textAlign: "center",
  },
});

import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../helpers/common";
import Avatar from "./Avatar";
import Button from "./Button";
import Header from "./Header";

const UserHeader = ({
  user,
  age,
  liczebnik,
  router,
  handleLogout,
  showActions = true,
}) => {
  const { theme } = useTheme();
  const [fontSize, setFontSize] = useState(24);
  const maxWidth = widthPercentage(50);

  useEffect(() => {
    if (user && user.name) {
      const nameLength = user.name.length;
      if (nameLength > 20) setFontSize(20);
      else if (nameLength > 15) setFontSize(22);
      else setFontSize(32);
    }
  }, [user]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: widthPercentage(3),
      }}
    >
      <View>
        <Header title="Profil użytkownika" showBackButton={true} />
      </View>
      <View style={{ justifyContent: "left", alignItems: "left" }}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize,
            maxWidth,
            color: theme.colors.text,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {user?.name}
        </Text>
        <Text style={{ color: theme.colors.text }}>
          {age} {liczebnik(age)}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              justifyContent: "left",
              alignItems: "left",
              width: widthPercentage(50),
            }}
          >
            <Text style={{ color: theme.colors.text }}>{user?.bio}</Text>
          </View>
          <View
            style={{
              width: widthPercentage(50),
              flexDirection: "row",
              justifyContent: "center",
              marginTop: heightPercentage(-6),
            }}
          >
            <Avatar
              uri={user?.image}
              size={heightPercentage(17)}
              rounded={theme.radius.small}
              enablePreview
            />
          </View>
        </View>
      </View>
      {showActions && (
        <View
          style={{
            marginTop: heightPercentage(2),
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <Button
            title="Edytuj profil"
            onPress={() => router.push("editProfile")}
            buttonStyle={{
              color: "red",
              width: widthPercentage(42),
              marginRight: widthPercentage(7),
              marginLeft: widthPercentage(3),
            }}
          />
          <Button
            title="Wyloguj"
            onPress={handleLogout}
            buttonStyle={{ color: "red", width: widthPercentage(42) }}
            textStyle={{ color: "red" }}
          />
        </View>
      )}
    </View>
  );
};

export default UserHeader;

import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Icon from "../../assets/icons";
import Loading from "../../components/Loading";
import PostCard from "../../components/PostCard";
import ScreenWrapper from "../../components/ScreenWrapper";
import UserHeader from "../../components/UserHeader";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../../helpers/common";
import { supabase } from "../../lib/supabase";
import { fetchPosts } from "../../services/postService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 375;
function responsiveFontSize(size) {
  return Math.round(size * scale);
}

const calculateAge = (birthdate) => {
  const birthDate = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const liczebnik = (age) => {
  if (age === 1) return "rok";
  if (
    (age > 1 && age < 5) ||
    (age % 10 > 1 && age % 10 < 5 && !(age % 100 >= 11 && age % 100 <= 14))
  )
    return "lata";
  return "lat";
};

const Profile = () => {
  const { theme } = useTheme();
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const age = user ? calculateAge(user.birthdate) : null;
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const limitRef = useRef(0);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Wyloguj", error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Wyloguj", "Czy na pewno chcesz się wylogować?", [
      {
        text: "Wyloguj",
        onPress: () => onLogout(),
        style: "destructive",
      },
      {
        text: "Anuluj",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
    ]);
  };

  const getPosts = async () => {
    if (!hasMore) return null;
    limitRef.current += 10;
    let res = await fetchPosts(limitRef.current, user.id);
    console.log("userId:", user.id);
    if (res.success) {
      if (posts.length == res.data.length) setHasMore(false);

      setPosts(res.data);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader
            user={user}
            age={age}
            liczebnik={liczebnik}
            router={router}
            handleLogout={handleLogout}
            showActions={true}
          />
        }
        ListHeaderComponentStyle={{ paddingBottom: heightPercentage(2) }}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <PostCard
              item={item}
              currentUser={user}
              router={router}
              gridMode={true}
            />
          </View>
        )}
        onEndReached={() => {
          getPosts();
        }}
        contentContainerStyle={styles.gridContainer}
        ListFooterComponent={
          hasMore ? (
            <View style={{ marginVertical: 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 25, alignItems: "center", gap: 10 }}>
              <Text style={[styles.noPosts, { color: theme.colors.text }]}>
                Brak większej ilości postów
              </Text>
              <Icon
                name="satelita"
                size={heightPercentage(5)}
                color={theme.colors.text}
              />
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  buttonStyle: {
    color: "red",
    width: widthPercentage(42),
  },
  editButton: {
    color: "red",
    width: widthPercentage(42),
    marginRight: widthPercentage(7),
    marginLeft: widthPercentage(3),
  },
  buttonText: {
    color: "red",
  },
  userName: {
    fontWeight: "bold",
  },
  avatarContainer: {
    width: widthPercentage(50),
    flexDirection: "row",
    justifyContent: "center",
    marginTop: heightPercentage(-6),
  },
  gridContainer: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  gridItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  noPosts: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});

import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import Icon from "../../assets/icons";
import Loading from "../../components/Loading";
import PostCard from "../../components/PostCard";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useTheme } from "../../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../../helpers/common";
import { getUserProfile } from "../../services/userService";

import { useRouter } from "expo-router";
import UserHeader from "../../components/UserHeader";
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

const Profile_others = () => {
  const { theme } = useTheme();
  const { userId } = useLocalSearchParams();

  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const age = userData ? calculateAge(userData.birthdate) : null;
  const limitRef = useRef(0);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!userId) {
      console.log("Brak userId!");
      return;
    }
    const fetchData = async () => {
      setLoading(true);

      const res = await getUserProfile(userId);

      if (res.success) {
        setUserData(res.data);
        setError(null);
      } else {
        setError(res.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const getPosts = async () => {
    if (!hasMore || !userData || !userData.id) return null;
    limitRef.current += 10;
    let res = await fetchPosts(limitRef.current, userData.id);
    if (res.success) {
      if (posts.length == res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  useEffect(() => {
    if (userData && userData.id) {
      getPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader
            user={userData}
            age={age}
            liczebnik={liczebnik}
            router={router}
            showActions={false}
          />
        }
        ListHeaderComponentStyle={{ paddingBottom: heightPercentage(2) }}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <PostCard
              item={item}
              currentUser={userData}
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

export default Profile_others;

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

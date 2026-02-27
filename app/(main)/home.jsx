import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../../assets/icons";
import Avatar from "../../components/Avatar";
import Input from "../../components/Input";
import Loading from "../../components/Loading";
import PostCard from "../../components/PostCard";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../../helpers/common";
import { getNotificationsCount } from "../../services/notificationService";
import { fetchPosts } from "../../services/postService";
import { fetchUsersByName, getUserData } from "../../services/userService";

const Home = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [limit, setLimit] = useState(10);
  const [openedMenuPostId, setOpenedMenuPostId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // const postsChannelRef = useRef(null);
  // const intervalRef = useRef(null);
  // const timeoutRef = useRef(null);

  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setIsPulling(false);
    try {
      await getPosts();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectUser = (selectedUser) => {
    setShowSearch(false);
    if (selectedUser.id === user.id) {
      router.push("profile");
    } else {
      router.push({
        pathname: "profile_others",
        params: { userId: selectedUser.id },
      });
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const [notifications, setNotifications] = useState(0);
  const getPosts = async () => {
    let res = await fetchPosts(limit);
    if (res.success) {
      setPosts(res.data);
      setHasMore(res.data.length == limit);
    }
    if (!user?.id) return;
    const cntRes = await getNotificationsCount(user.id);
    if (cntRes?.success) setNotifications(cntRes.count);
  };

  // tymczasowo bezużyteczne, ponieważ nie działa poprawnie subskrypcja kanału, w celu odświeżenia tablicy, należy przeciągnąć w dół.
  const handleEvent = async (payload) => {
    console.log("payload: ", payload);
    if (payload.eventType == "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts((prev) => [newPost, ...prev]);
    }
    if (payload.eventType == "DELETE" && payload.old.id) {
      setPosts((prev) => {
        let updatedPosts = prev.filter((post) => post.id !== payload.old.id);
        return updatedPosts;
      });
    }
    if (payload.eventType == "UPDATE" && payload?.new?.id) {
      setPosts((prev) => {
        let updatedPosts = prev.map((post) => {
          if (post.id === payload.new.id) {
            post.body = payload.new.body;
            post.file = payload.new.file;
          }
          return post;
        });
        return updatedPosts;
      });
    }
  };

  const handleNewNotificationEvent = async (payload) => {
    console.log("New notification payload: ", payload);
    if (payload.eventType === "INSERT" && payload.new.id) {
      setNotifications((prev) => prev + 1);
    }
    if (payload.eventType === "DELETE" && payload.old.id) {
      setNotifications((prev) => prev - 1);
    }
  };

  // Problem z subskrypcją kanału, która nie działa poprawnie, na potrzeby testów, oraz prezentacji funkcja zakomentowana, w celu odświeżenia tablicy, należy przeciągnąć w dół.

  // const subscribeToPostsChannel = () => {
  //   if (postsChannelRef.current) {
  //     supabase.removeChannel(postsChannelRef.current);
  //     postsChannelRef.current = null;
  //   }
  //   const postschannel = supabase
  //     .channel('posts')
  //     .on('postgres_changes', {
  //       event: '*',
  //       schema: 'public',
  //       table: 'posts'
  //     }, handleEvent)
  //     .subscribe(
  //         status => {
  //       console.log('posts channel status:', status);
  //     }
  // );
  //   postsChannelRef.current = postschannel;
  // //   console.log('Subscribed to posts channel');
  // };

  // const unsubscribeFromPostsChannel = () => {
  //   if (postsChannelRef.current) {
  //     supabase.removeChannel(postsChannelRef.current);
  //     postsChannelRef.current = null;
  //     // console.log('Unsubscribed from posts channel');
  //   }
  // };

  // const subscribeToNotificationsChannel = () => {
  //   if (postsChannelRef.current) {
  //     supabase.removeChannel(postsChannelRef.current);
  //     postsChannelRef.current = null;
  //   }
  //   const notificationsChannel = supabase
  //     .channel('notifications')
  //     .on('postgres_changes', {
  //       event: '*',
  //       schema: 'public',
  //       table: 'notifications'
  //     }, handleNewNotificationEvent)
  //     .subscribe(
  //     //     status => {
  //     //   console.log('notifications channel status:', status);
  //     // }
  // );
  //   postsChannelRef.current = notificationsChannel;
  // //   console.log('Subscribed to notifications channel');
  // };

  // const unsubscribeFromNotificationsChannel = () => {
  //   if (postsChannelRef.current) {
  //     supabase.removeChannel(postsChannelRef.current);
  //     postsChannelRef.current = null;
  //     // console.log('Unsubscribed from notifications channel');
  //   }
  // }

  // useEffect(() => {
  //
  //     const cycle = () => {
  //       subscribeToPostsChannel();
  //       subscribeToNotificationsChannel();
  //       timeoutRef.current = setTimeout(() => {
  //         unsubscribeFromPostsChannel();
  //         unsubscribeFromNotificationsChannel();
  //       }, 19000);
  //     };

  //     cycle();

  //     intervalRef.current = setInterval(() => {
  //       cycle();
  //     }, 20000);

  //     return () => {
  //       clearInterval(intervalRef.current);
  //       clearTimeout(timeoutRef.current);
  //       unsubscribeFromPostsChannel();
  //       unsubscribeFromNotificationsChannel();
  //     };
  // }, []);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     subscribeToPostsChannel();
  //     subscribeToNotificationsChannel();

  //
  //     return () => {
  //         unsubscribeFromPostsChannel();
  //         unsubscribeFromNotificationsChannel
  //     };
  //   }, [])
  // );

  useEffect(() => {
    getPosts();
  }, [limit]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    let active = true;
    fetchUsersByName(searchQuery).then((res) => {
      if (active && res.success) setSearchResults(res.data.slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, [searchQuery]);

  return (
    <ScreenWrapper bg={theme.colors.background}>
      {showSearch && (
        <>
          <Pressable style={styles.searchOverlay} onPress={handleCloseSearch} />
          <View
            style={[
              styles.searchDropdown,
              {
                backgroundColor: theme.colors.background,
                shadowColor: theme.colors.text,
              },
            ]}
          >
            <Input
              placeholder="Wyszukaj użytkownika..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 1 &&
              (searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.searchResult}
                    onPress={() => handleSelectUser(item)}
                  >
                    <Avatar uri={item.image} size={32} />
                    <Text style={{ marginLeft: 10, color: theme.colors.text }}>
                      {item.name}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={{ color: theme.colors.textLight, marginTop: 10 }}>
                  Brak wyników
                </Text>
              ))}
          </View>
        </>
      )}

      <StatusBar
        style={theme.colors.background === "#181818" ? "light" : "dark"}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text
            style={[
              styles.headerText,
              { color: theme.colors.text, fontWeight: theme.fonts.bold },
            ]}
          >
            OurBlogWall
          </Text>
          <View style={styles.icons}>
            <View>
              <Pressable onPress={() => setShowSearch((v) => !v)}>
                <Icon
                  name="search"
                  size={heightPercentage(3.2)}
                  strokeWidth={2}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>
            <Pressable onPress={() => router.push("notifications")}>
              <Icon
                name="heart"
                size={heightPercentage(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
              {notifications > 0 && (
                <View
                  style={[
                    styles.pill,
                    { backgroundColor: theme.colors.roseLight },
                  ]}
                >
                  <Text style={styles.pillText}>{notifications}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push("newPost")}>
              <Icon
                name="add"
                size={heightPercentage(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => setShowUserMenu(true)}>
              <Avatar
                uri={user?.image}
                size={heightPercentage(4.3)}
                rounded={theme.radius.small}
                style={{ borderWidth: 2, borderColor: theme.colors.textLight }}
              />
            </Pressable>
          </View>
        </View>
        <FlatList
          data={posts}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard
              item={item}
              currentUser={user}
              router={router}
              menuVisible={openedMenuPostId === item.id}
              onMenuOpen={() => setOpenedMenuPostId(item.id)}
              onMenuClose={() => setOpenedMenuPostId(null)}
              showMenu={false}
            />
          )}
          onEndReached={() => {
            getPosts();
            if (hasMore) setLimit((prev) => prev + 10);
          }}
          onScroll={({ nativeEvent }) => {
            if (nativeEvent.contentOffset.y <= 0 && !refreshing) {
              setIsPulling(true);
            } else {
              setIsPulling(false);
            }
          }}
          ListHeaderComponent={
            isPulling && !refreshing ? (
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.textLight,
                  marginBottom: 5,
                }}
              >
                Przeciągnij w dół, aby odświeżyć
              </Text>
            ) : refreshing ? (
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.textLight,
                  marginBottom: 5,
                }}
              >
                Odświeżanie...
              </Text>
            ) : null
          }
          ListFooterComponent={
            hasMore ? (
              <View style={{ marginVertical: 30 }}>
                <Loading />
              </View>
            ) : (
              <View
                style={{ marginVertical: 25, alignItems: "center", gap: 10 }}
              >
                <Text style={[styles.noPosts, { color: theme.colors.text }]}>
                  Voyager w tyle, a Twój głód contentu wciąż nie zaspokojony?
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
      </View>
      {showUserMenu && (
        <>
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setShowUserMenu(false)}
          />
          <View
            style={[
              styles.userMenu,
              {
                backgroundColor: theme.colors.background,
                shadowColor: theme.colors.text,
              },
            ]}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowUserMenu(false);
                router.push("profile");
              }}
            >
              <Icon name="user" />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Mój profil
              </Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowUserMenu(false);
                router.push("settings");
              }}
            >
              <Icon name="settings" />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Ustawienia
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: widthPercentage(4),
  },
  headerText: {
    fontSize: heightPercentage(3.4),
  },
  avatarImage: {
    height: heightPercentage(4.3),
    width: widthPercentage(4.3),
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  listStyle: {
    paddingHorizontal: widthPercentage(4),
    paddingTop: 20,
  },
  noPosts: {
    fontSize: heightPercentage(2),
    textAlign: "center",
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: heightPercentage(2),
    width: widthPercentage(2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  pillText: {
    color: "white",
    fontSize: heightPercentage(1.5),
    fontWeight: "bold",
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.01)",
    zIndex: 10,
  },
  userMenu: {
    position: "absolute",
    top: 60,
    right: 20,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 20,
  },
  menuItem: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 8,
  },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  searchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  searchDropdown: {
    position: "absolute",
    top: 105,
    right: 45,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    width: 250,
    zIndex: 201,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});

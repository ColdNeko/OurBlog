import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
//prettier-ignore
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import Icon from "../../assets/icons";
import CommentCard from "../../components/CommentCard";
import Header from "../../components/Header";
import Input from "../../components/Input";
import Loading from "../../components/Loading";
import PostCard from "../../components/PostCard";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { heightPercentage, widthPercentage } from "../../helpers/common";
import { supabase } from "../../lib/supabase";
import { createNotification } from "../../services/notificationService";
//prettier-ignore
import { fetchPostDetails, postComment, removeComment, removePost, } from "../../services/postService";
import { getUserData } from "../../services/userService";

const PostDetails = () => {
  const { postId, commentId } = useLocalSearchParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(true);
  const inputRef = useRef(null);
  const commentRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const commentChannelRef = useRef(null);

  const [post, setPost] = useState(null);

  const handleCommentEvent = async (payload) => {
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      setPost((prev) => {
        if (prev?.comments?.some((c) => c.id === newComment.id)) return prev;
        return {
          ...prev,
          comments: [newComment, ...(prev?.comments || [])],
        };
      });
    }
  };

  const getPostDetails = async () => {
    let res = await fetchPostDetails(postId);
    if (res.success) setPost(res.data);
    setStartLoading(false);
  };

  const onNewComment = async () => {
    if (!commentRef.current) return null;
    let data = {
      userId: user?.id,
      postId: post?.id,
      text: commentRef.current,
    };

    setLoading(true);
    let res = await postComment(data);
    setLoading(false);
    if (res.success) {
      if (user.id != post.userId) {
        let notificationData = {
          senderId: user.id,
          receiverId: post.userId,
          title: "Skomentował twój post",
          data: JSON.stringify({ postId: post.id, commentId: res?.data.id }),
        };
        createNotification(notificationData);
      }

      inputRef?.current?.clear();
      commentRef.current = "";

      const newComment = {
        ...res.data,
        user: user,
      };
      setPost((prev) => ({
        ...prev,
        comments: [newComment, ...(prev?.comments || [])],
      }));
    } else {
      Alert.alert("Błąd", res.message || "Nie udało się dodać komentarza");
    }
  };

  const onDeleteComment = async (comment) => {
    let res = await removeComment(comment?.id);
    if (res.success) {
      setPost((prev) => {
        let updatedPost = { ...prev };
        updatedPost.comments = updatedPost.comments.filter(
          (c) => c.id != comment.id,
        );
        return updatedPost;
      });
    } else {
      Alert.alert("Błąd", res.message || "Nie udało się usunąć komentarza");
    }
  };

  const onDeletePost = async (item) => {
    let res = await removePost(post.id);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Błąd", res.message || "Nie udało się usunąć posta");
    }
  };

  const onEditPost = (item) => {
    router.back();
    router.push({ pathname: "newPost", params: { ...item } });
  };

  useEffect(() => {
    if (commentChannelRef.current) {
      supabase.removeChannel(commentChannelRef.current);
      commentChannelRef.current = null;
    }

    const channel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
        },
        handleCommentEvent,
      )
      .subscribe((status) => {
        console.log("Comment channel status:", status);
      });

    commentChannelRef.current = channel;

    getPostDetails();

    return () => {
      if (commentChannelRef.current) {
        supabase.removeChannel(commentChannelRef.current);
        commentChannelRef.current = null;
      }
    };
  }, [postId]);

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={
          theme.colors.background === "#181818"
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={theme.colors.background}
      />
      <Header
        title={`Post użytkownika ${post?.user?.name || ""}`}
        showBackButton={true}
        marginButton={20}
        showMessageButton={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <PostCard
          item={{ ...post, comments: [{ count: post?.comments?.length }] }}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreButton={false}
          showDeleteButton={true}
          onDelete={onDeletePost}
          onEdit={onEditPost}
          menuVisible={menuVisible}
          onMenuOpen={() => setMenuVisible(true)}
          onMenuClose={() => setMenuVisible(false)}
          showMenu={true}
        />

        {/* Blok komentarzy */}
        <View
          style={[styles.commentsBlock, { backgroundColor: theme.colors.gray }]}
        >
          <Text
            style={[
              styles.commentsTitle,
              { color: theme.colors.textLight, fontWeight: theme.fonts.medium },
            ]}
          >
            Komentarze
          </Text>
          <View style={styles.inputContainer}>
            <Input
              inputRef={inputRef}
              placeholder="Napisz komentarz..."
              onChangeText={(text) => (commentRef.current = text)}
              placeholderTextColor={theme.colors.textLight}
              containerStyle={{
                flex: 1,
                height: heightPercentage(5.8),
                borderRadius: theme.radius.large,
              }}
            />
            {loading ? (
              <View style={styles.loading}>
                <Loading />
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sendIcon,
                  {
                    borderColor: theme.colors.primary,
                    borderRadius: theme.radius.large,
                  },
                ]}
                onPress={onNewComment}
              >
                <Icon
                  name="sendMessage"
                  size={heightPercentage(3.5)}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ marginVertical: 15, gap: 17 }}>
            {post?.comments?.map((comment) => (
              <CommentCard
                key={comment?.id?.toString()}
                item={comment}
                deletable={comment.userId == user.id || post.userId == user.id}
                isAdmin={user?.isAdmin === true}
                higlight={commentId == comment.id}
                onDelete={onDeleteComment}
                router={router}
                currentUser={user}
              />
            ))}
            {post?.comments?.length == 0 && (
              <View style={styles.center}>
                <Text
                  style={[
                    styles.notFound,
                    {
                      color: theme.colors.text,
                      fontWeight: theme.fonts.medium,
                    },
                  ]}
                >
                  Brak komentarzy
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: widthPercentage(6),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: widthPercentage(2),
  },
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderCurve: "continuous",
    height: heightPercentage(5.8),
    width: heightPercentage(5.8),
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    fontSize: heightPercentage(2.5),
  },
  loading: {
    height: heightPercentage(5.8),
    width: heightPercentage(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.2 }],
  },
  commentsBlock: {
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: heightPercentage(2.2),
    marginBottom: 10,
    alignSelf: "center",
  },
  menuWrapper: {
    position: "absolute",
    top: 40,
    right: 20,
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
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuText: {
    fontSize: heightPercentage(2.2),
  },
  menuIcon: {
    marginRight: 8,
  },
});

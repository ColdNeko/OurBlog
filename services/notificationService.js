import { supabase } from "../lib/supabase";

export const createNotification = async (notification) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.log("notification error:", error.message);
      return { success: false, message: error.message };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("notification error:", error.message);
    return { success: false, message: error.message };
  }
};

export const removeNotification = async (notificationsId) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationsId);

    if (error) {
      console.log("removeNotification error:", error.message);
      return { success: false, message: error.message };
    }
    return { success: true, data: { notificationsId } };
  } catch (error) {
    console.log("removeNotification error:", error.message);
    return { success: false, message: error.message };
  }
};

export const fetchNotification = async (receiverId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
            *,
            sender: senderId (
                id,
                name,
                image
            )
            `,
      )
      .eq("receiverId", receiverId)
      .eq("read", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("fetchNotification error:", error.message);
      return { success: false, message: error.message };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("fetchNotifications error:", error.message);
    return { success: false, message: error.message };
  }
};

export const getNotificationsCount = async (receiverId) => {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("read", false)
      .eq("receiverId", receiverId);

    if (error) {
      console.log("getNotificationsCount error:", error.message);
      return { success: false, message: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.log("getNotificationsCount exception:", error.message);
    return { success: false, message: error.message };
  }
};

export const markAllNotificationsRead = async (receiverId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("receiverId", receiverId);

    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

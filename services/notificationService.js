import { supabase } from "../lib/supabase";

export const createNotification = async (notification) => {
    try {
        const {data, error} = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

        if(error){
            console.log('notification error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true, data: data};

    } catch (error) {
        console.log('notification error:', error.message);
        return { success: false, message: error.message };
    }
};


export const removeNotification = async (notificationsId) => {
    try {
        const {error} = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationsId)
        

        if(error){
            console.log('removeNotification error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true, data: {notificationsId}};

    } catch (error) {
        console.log('removeNotification error:', error.message);
        return { success: false, message: error.message };
    }
};


export const fetchNotification = async (receiverId) => {
    try {
       const {data, error} = await supabase
        .from('notifications')
        .select(`
            *,
            sender: senderId (
                id,
                name,
                image
            )
            `)
        .eq('receiverId', receiverId)
        .order('created_at', {ascending: false})
  

        if(error){
            console.log('fetchNotification error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true, data: data};

    } catch (error) {
        console.log('fetchNotifications error:', error.message);
        return { success: false, message: error.message };
    }
};

export const getNotificationsCount = async () => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('receiverId', user.id)
   

  if (!error) setNotifications(count || 0);
};
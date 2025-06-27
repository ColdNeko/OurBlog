import { supabase } from "../lib/supabase";

export const getUserData = async (userId) => {
    try {
        const {data, error} = await supabase
            .from('users')
            .select('id, name, image, bio, birthdate, phoneNumber, isAdmin')
            .eq('id', userId)
            .single();
            if(error){
                return {success: false, message: error?.message};
            }
            return {success: true, data};
    }catch(error){
        console.log('getUserData',error.message);
        return {success: false, message: error.message};
    }
}



export const updateUser = async (userId, data) => {
    try {
        const { error} = await supabase
            .from('users')
            .update(data)
            .eq('id', userId);

            if(error){
                return {success: false, message: error?.message};
            }
            return {success: true, data};
    }catch(error){
        console.log('getUserData',error.message);
        return {success: false, message: error.message};
    }
}

export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, image, bio, email, birthdate, phoneNumber')
            .eq('id', userId)
            .single();
        if (error) {
            
            return { success: false, message: error.message };
        }
        return { success: true, data };
    } catch (error) {
        
        return { success: false, message: error.message };
    }
};

export const fetchUsersByName = async (name) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, image')
      .ilike('name', `%${name}%`)
      .order('name', { ascending: true });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
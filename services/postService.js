import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
    try {
        //console.log('Initial post:', post);

        if (post.file && typeof post.file === 'object') {
            let isImage = post?.file?.type.startsWith('image');
            let folderName = isImage ? 'postImages' : 'postVideos';
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
          //  console.log('File upload result:', fileResult);

            if (fileResult.success) {
                post.file = fileResult.data;
            } else {
                return fileResult;
            }
        }

       // console.log('Post before upsert:', post);

        const { data, error } = await supabase
            .from('posts')
            .upsert(post)
            .select()
            .single();

        //console.log('Supabase response:', { data, error });

        if (error) {
            console.log('createOrUpdatePost', error.message);
            return { success: false, message: error.message };
        }

        return { success: true, data: data };

    } catch (error) {
        console.log('createOrUpdatePost', error.message);
        return { success: false, message: error.message };
    }
};

export const removePost = async (postId) => {
    try {
        const {error} = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        

        if(error){
            console.log('removePost error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true, data: {postId}};

    } catch (error) {
        console.log('removePost error:', error.message);
        return { success: false, message: error.message };
    }
};


export const fetchPosts = async (limit=10, userId) => {
    try {
            if(userId){
                   const {data, error} = await supabase
        .from('posts')
        .select(`
            *, 
            user: users (id, name, image),
            postLikes (*),
            comments (count)
            `)
        .order('created_at', {ascending: false})
        .eq('userId', userId)
        .limit(limit);

        if(error){
            console.log('fetchPosts error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true, data: data};
            }else{
                        const {data, error} = await supabase
            .from('posts')
            .select(`
                *, 
                user: users (id, name, image),
                postLikes (*),
                comments (count)
                `)
            .order('created_at', {ascending: false})
            .limit(limit);

            if(error){
                console.log('fetchPosts error:', error.message);
                return {success: false, message: error.message};
            }
            return {success: true, data: data};
                }

    } catch (error) {
        console.log('fetchPost error:', error.message);
        return { success: false, message: error.message };
    }
};


export const fetchPostDetails = async (postId) => {
    try {
       const {data, error} = await supabase
        .from('posts')
        .select(`
            *, 
            user: users (id, name, image),
            postLikes (*),
            comments (*, user: users(id, name, image))`)
        .eq('id', postId)
        .order('created_at', {ascending: false, foreignTable: 'comments'})
        .single();

        if(error){
            console.log('fetchPostDetails error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true, data: data};

    } catch (error) {
        console.log('fetchPost error:', error.message);
        return { success: false, message: error.message };
    }
};


export const createPostLike = async (postLike) => {
    try {
        const {data, error} = await supabase
        .from('postLikes')
        .insert(postLike)
        .select()
        .single();

        if(error){
            console.log('postLike error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true, data: data};

    } catch (error) {
        console.log('postLike error:', error.message);
        return { success: false, message: error.message };
    }
};

export const removePostLike = async (postId, userId) => {
    try {
        const {error} = await supabase
        .from('postLikes')
        .delete()
        .eq('postId', postId)
        .eq('userId', userId);

        if(error){
            console.log('postLike error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true};

    } catch (error) {
        console.log('postLike error:', error.message);
        return { success: false, message: error.message };
    }
};

export const removeComment = async (commentId) => {
    try {
        const {error} = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        

        if(error){
            console.log('removeComment error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true, data: {commentId}};

    } catch (error) {
        console.log('removeComment error:', error.message);
        return { success: false, message: error.message };
    }
};

export const postComment = async (comment) => {
    try {
        const {data, error} = await supabase
        .from('comments')
        .insert(comment)
        .select()
        .single();

        if(error){
            console.log('comment error:', error.message);
            return {success: false, message: error.message};
        }
        return {success: true, data: data};

    } catch (error) {
        console.log('comment error:', error.message);
        return { success: false, message: error.message };
    }
};



export const createCommentLike = async (commentLike) => {
    try {
        const { data, error } = await supabase
            .from('commentLikes')
            .insert(commentLike)
            .select()
            .single();

        if (error) {
            console.log('commentLike error:', error.message);
            return { success: false, message: error.message };
        }
        return { success: true, data };
    } catch (error) {
        console.log('commentLike error:', error.message);
        return { success: false, message: error.message };
    }
};

export const removeCommentLike = async (commentId, userId) => {
    try {
        const { error } = await supabase
            .from('commentLikes')
            .delete()
            .eq('commentId', commentId)
            .eq('userId', userId);

        if (error) {
            console.log('commentLike error:', error.message);
            return { success: false, message: error.message };
        }
        return { success: true };
    } catch (error) {
        console.log('commentLike error:', error.message);
        return { success: false, message: error.message };
    }
};

export const fetchCommentLikes = async (commentId) => {
    try {
        const { data, error } = await supabase
            .from('commentLikes')
            .select('*')
            .eq('commentId', commentId);

        if (error) {
            console.log('fetchCommentLikes error:', error.message);
            return { success: false, message: error.message };
        }
        return { success: true, data };
    } catch (error) {
        console.log('fetchCommentLikes error:', error.message);
        return { success: false, message: error.message };
    }
};
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabaseUrl } from '../constants';
import { supabase } from '../lib/supabase'; // Ensure you import supabase from your configuration file

export const getUserImageSource = imagePath => {
    if (imagePath) {
        return { uri: `${supabaseUrl}/storage/v1/object/public/uploads/${imagePath}` };
    } else {
        return require('../assets/images/defaultUser.png');
    }
};

export const getSupabaseFileUrl = filePath =>{
    if(filePath){
        return { uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}` };
    }
    return null;
}

export const uploadFile = async (folderName, fileUri, isImage = true) => {
    try {
        let fileName = getFilePath(folderName, isImage);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64
        });
        let imageData = decode(fileBase64);
        let { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(fileName, imageData, {
                cacheControl: '3600',
                upsert: false,
                contentType: isImage ? 'image/png' : 'video/mp4'
            });
        if (error) {
            console.log('uploadFile', error.message);
            return { success: false, message: error.message };
        }

        console.log('data', data);

        return { success: true, data: data.path };
    } catch (error) {
        console.log('uploadFile', error.message);
        return { success: false, message: error.message };
    }
};

export const getFilePath = (folderName, isImage) => {
    const extension = isImage ? '.png' : '.mp4';
    const timestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
    return `${folderName}/${timestamp}${extension}`;
};

export const downloadFile = async (url) => {
    try {
        const {uri} = await FileSystem.downloadAsync(url, getLocalFilePath(url));
        return uri;
    } catch (error) {
        return null;
    }
}

export const getLocalFilePath = filePath => {
    let fileName = filePath.split('/').pop();
    return `${FileSystem.documentDirectory}${fileName}`;
}
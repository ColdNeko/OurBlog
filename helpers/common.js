import { Dimensions } from 'react-native';

const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window');

export const heightPercentage = (percentage) => (deviceHeight * percentage) / 100;

export const widthPercentage = (percentage) => (deviceWidth * percentage) / 100;

export const stripHtmlTags = (html) => {
    return html.replace(/<[^>]*>?/gm, '');
};
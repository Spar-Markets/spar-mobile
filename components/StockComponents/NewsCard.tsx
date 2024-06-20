import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useNavigation } from '@react-navigation/native';

const NewsCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createStockSearchStyles(theme, width);
    const navigation = useNavigation<any>();

    const handlePress = async (url: string) => {
        // Checking if the link is supported for links with custom schemes (e.g., "https")
        const supported = await Linking.canOpenURL(url);
    
        if (supported) {
          // Opening the link
          await Linking.openURL(url);
        } else {
          console.error("Don't know how to open URI: " + url);
        }
        console.log(url)
        //navigation.navigate('WebViewScreen', {url: url});
    };

    return (
        <TouchableOpacity
            onPress={() => handlePress(props.article_url)} style={styles.newsCardContainer}>
            <View style={{flex: 1}}>
                <Image
                    style={{borderTopLeftRadius: 9, borderTopRightRadius: 9, height: 100}}
                    source={{uri: props.image_url}}
                />
                <Text style={styles.newsTitle}>{props.title}</Text>
                <View style={{flex: 1}}></View>
                <View style={styles.bottomContainer}>
                    <Text style={styles.bottomText}>{props.timeAgo}</Text>
                    <View style={{flex: 1}}></View>
                    <Text style={styles.bottomText}>{props.publisherName}</Text>
                </View>
             
            </View>
        </TouchableOpacity>
    )
}

export default NewsCard


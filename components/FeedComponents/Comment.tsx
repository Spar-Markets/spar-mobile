import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import timeAgo from '../../utility/timeAgo';
import Gap from '../HomeComponents/Gap';
import CommentGap from './CommentGap';

const Comment = React.memo((props: any) => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width)

    return (
        <View style={styles.commentContainer}>
            <View>

            </View>
            <View style={{ flexDirection: 'row' }}>
                <Image style={{ width: 25, height: 25, borderRadius: 50 }} source={require("../../assets/images/profilepic.png")}></Image>
                <View>
                    <Text style={styles.usernameAndTime}>{props.username} • {timeAgo(new Date(props.postedTime))}</Text>
                    <Text style={[styles.messageText, { marginHorizontal: 10 }]}>{props.body}</Text>
                </View>

            </View>
        </View>
    )
})

export default Comment;
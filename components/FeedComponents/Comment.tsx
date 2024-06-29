import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import timeAgo from '../../utility/timeAgo';
import Gap from '../HomeComponents/Gap';
import CommentGap from './CommentGap';

const Comment = React.memo((props:any) => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width)

    useEffect(() => {
        console.log("COMMENT RENDERED: " + props.body)
    })
    
    return (
    <View style={styles.commentContainer}>
        <View style={{marginHorizontal: 20}}>
          <View>
            <View style={styles.postTopContainer}>
                <Image style={styles.postPic} source={require("../../assets/images/profilepic.png")}></Image>
                <Text style={styles.usernameAndTime}>{props.username} • {timeAgo(new Date(props.postedTime))}</Text>
                <View style={{flex: 1}}></View>
            </View>
            <Text style={styles.messageText}>{props.body}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', paddingTop: 5}}>

            <View style={{flex: 1}}></View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 }}>
                <TouchableOpacity style={{paddingRight: 5}}>
                    <Animated.View>
                    <Icon name="arrow-up" style={/*post.isUpvoted ? { color: theme.colors.stockUpAccent } : */{ color: theme.colors.secondaryText }} size={20} />
                    </Animated.View>
                </TouchableOpacity>
                <Text style={styles.votesText}>56</Text>
                <TouchableOpacity style={{paddingLeft: 5}}>
                    <Animated.View>
                    <Icon name="arrow-down" style={/*post?.isDownvoted ? { color: theme.colors.stockDownAccent } :*/ { color: theme.colors.secondaryText }} size={20} />
                    </Animated.View>
                </TouchableOpacity>
            </View>
          </View>
        </View> 
    </View>
    )
})

export default Comment;
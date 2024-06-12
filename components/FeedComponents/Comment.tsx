import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import timeAgo from '../../utility/timeAgo';
import Gap from '../HomeComponents/Gap';
import CommentGap from './CommentGap';

const Comment = (props:any) => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width)
    
    return (
    <View style={styles.commentContainer}>
        <CommentGap/>
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
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Icon name="comment" style={{color: theme.colors.secondaryText}} size={20}/>
                <Text style={{color: theme.colors.secondaryText, fontWeight: 'bold'}}>Reply</Text>
            </TouchableOpacity>
            <View style={{flex: 1}}></View>
            <View style={{flexDirection: 'row', gap: 5, alignItems:'center'}}>
                <TouchableOpacity>
                    <Icon name="arrow-circle-o-up" style={props.isUpvoted ? {color: theme.colors.text} : {color: theme.colors.secondaryText}} size={24}/>
                </TouchableOpacity>
                    <Text style={styles.commentVotesText}>2</Text>
                <TouchableOpacity>
                    <Icon name="arrow-circle-o-down" style={props.isDownvoted ? {color: theme.colors.text} : {color: theme.colors.secondaryText}} size={24}/>
                </TouchableOpacity>
            </View>
          </View>
          {/*<View>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 5}}>
                <Icon name="comment" style={{color: theme.colors.secondaryText}} size={24}/>
                <Text style={{color: theme.colors.secondaryText}}>{props.numComments}</Text>
            </TouchableOpacity>
            <View style={{flex: 1}}></View>

            <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                <TouchableOpacity>
                    <Icon name="arrow-circle-o-up" style={props.isUpvoted ? {color: theme.colors.text} : {color: theme.colors.secondaryText}} size={32}/>
                </TouchableOpacity>
                <Text style={styles.votesText}>{props.votes}</Text>
                <TouchableOpacity>
                    <Icon name="arrow-circle-o-down" style={props.isDownvoted ? {color: theme.colors.text} : {color: theme.colors.secondaryText}} size={32}/>
                </TouchableOpacity>
            </View>
            </View>*/}
        </View> 
    </View>
    )
}

export default Comment;
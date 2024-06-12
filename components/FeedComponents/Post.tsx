import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Image, ScrollView } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import AwesomeIcon from 'react-native-vector-icons/';
import Gap from '../HomeComponents/Gap';
import { useNavigation } from '@react-navigation/native';
import PostType from '../../types/PostType';
import timeAgo from '../../utility/timeAgo';

import { useDispatch } from 'react-redux';
import { upvotePost, downvotePost } from '../../FeedManagment/postSlice';

interface PostProps extends PostType {
    navigateToComments: () => void;
}

interface CategoryStyles {
    [key: string]: { backgroundColor: string };
}

const Post = (props:any) => {

    // Layout and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width)

    const navigation = useNavigation<any>();

    const [typeColor, setTypeColor] = useState(theme.colors.discussion)
 
    const dispatch = useDispatch();

    const upvote = () => {
      dispatch(upvotePost(props.postId));
      console.log("upvoted")
    };
  
    const downvote = () => {
      dispatch(downvotePost(props.postId));
    };

    const navigateToComments = () => {
        navigation.navigate("CommentPage", {
            postId: props.postId,
            username: props.username,
            postedTime: props.postedTime,
            type: props.type,
            title: props.title,
            body: props.body,
            votes: props.votes,
            numComments: props.numComments,
            numReposts: props.numReposts,
            hasImage: props.hasImage,
            isUpvoted: props.isUpvoted,
            isDownvoted: props.isDownvoted,
      
    })
        
    }

    const [categoryBtnBackground, setCategoryBtnBackground] = useState("")

    const categoryButton = (category: string) => {

        const categoryStyles: CategoryStyles = {
            Discussion: { backgroundColor: theme.colors.discussion },
            Meme: { backgroundColor: theme.colors.meme },
            News: { backgroundColor: theme.colors.news },
            Dub: { backgroundColor: theme.colors.dub },
            Question: { backgroundColor: theme.colors.question },
       };
  
        return (
            <View style={[categoryStyles[category] || {}, {borderRadius: 50}]}>
                <Text style={{ color: theme.colors.text, fontWeight: 'bold', paddingVertical: 5, paddingHorizontal: 10 }}>{category}</Text>
            </View>
        )
    }
    
    return (
    <View style={styles.postsContainer}>
            <View>
                <View style={styles.postTopContainer}>
                    <Image style={styles.postPic} source={require("../../assets/images/profilepic.png")}></Image>
                    <Text style={styles.usernameAndTime}>{props.username} • {timeAgo(new Date(props.postedTime))}</Text>
                    <View style={{flex: 1}}></View>
                    {categoryButton(props.type)}
                </View>
                <Text style={styles.subjectText}>{props.title}</Text>
                <Text style={styles.messageText}>{props.body}</Text>
                {props.hasImage === true && <Image style={styles.mainPic} source={require("../../assets/images/testPost.png")}/>}
                <View style={styles.postBottomContainer}>
                    {/*Used to remake post on comment page without recalling db*/}
                    <TouchableOpacity onPress={navigateToComments} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 5}}>
                        <Icon name="comments" style={{color: theme.colors.secondaryText}} size={24}/>
                        <Text style={{color: theme.colors.secondaryText}}>{props.numComments}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 5}}>
                        <Icon name="retweet" style={{color: theme.colors.secondaryText}} size={24}/>
                        <Text style={{color: theme.colors.secondaryText}}>{props.numReposts}</Text>
                    </TouchableOpacity>
                    <View style={{flex: 1}}></View>

                    <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                        <TouchableOpacity onPress={upvote}>
                            <Icon name="arrow-circle-o-up" style={props.isUpvoted ? {color: theme.colors.text} : {color: theme.colors.secondaryText}} size={32}/>
                        </TouchableOpacity>
                        <Text style={styles.votesText}>{props.votes}</Text>
                        <TouchableOpacity onPress={downvote}>
                            <Icon name="arrow-circle-o-down" style={props.isDownvoted ? {color: theme.colors.text} : {color: theme.colors.secondaryText}} size={32}/>
                        </TouchableOpacity>
                    </View>
                             
                </View>
            </View>
            
    </View>
    )
}

export default Post;
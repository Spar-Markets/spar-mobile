import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Image, ScrollView, Easing, Touchable, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import AwesomeIcon from 'react-native-vector-icons/';
import Gap from '../HomeComponents/Gap';
import { useNavigation } from '@react-navigation/native';
import PostType from '../../types/PostType';
import timeAgo from '../../utility/timeAgo';
import axios from 'axios'
import { shallowEqual, useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { upvotePost, downvotePost, setUpvoteStatus, setDownvoteStatus } from '../../GlobalDataManagment/postSlice';
import { serverUrl } from '../../constants/global';
import Voting from './Voting';
import { Skeleton } from '@rneui/themed';


interface PostProps extends PostType {
    postedTimeAgo: string;
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

    const userData = useSelector((state: any) => state.user.userData, shallowEqual);
    const dispatch = useDispatch();

    const navigation = useNavigation<any>();
    
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

    const [loading, setLoading] = useState(true)

    // Sets initial votes on rerender
    useEffect(() => {
        const setVote = async () => {
        try {
            console.log("userID:", userData.userID, " postId:", props.postId)
            const newVoteStatus = await axios.post(serverUrl + '/getVoteStatus', { userID: userData.userID, postId: props.postId });
            if (newVoteStatus.data.voteType === 'up') {
                dispatch(setUpvoteStatus({ postId: props.postId, isUpvoted: true }));
                dispatch(setDownvoteStatus({ postId: props.postId, isDownvoted: false }));
            } else if (newVoteStatus.data.voteType === 'down') {
                dispatch(setUpvoteStatus({ postId: props.postId, isUpvoted: false }));
                dispatch(setDownvoteStatus({ postId: props.postId, isDownvoted: true }));
            } else {
                dispatch(setUpvoteStatus({ postId: props.postId, isUpvoted: false }));
                dispatch(setDownvoteStatus({ postId: props.postId, isDownvoted: false }));
            }
            setLoading(false)
        } catch (error) {
            console.error('Error getting vote status:', error);
            setLoading(false)
        }
        };

        setVote();
    }, [dispatch, props.postId, userData.userID]);

    const categoryButton = (category: string) => {

        const categoryStyles: CategoryStyles = {
            Discussion: { backgroundColor: theme.colors.discussion },
            Meme: { backgroundColor: theme.colors.meme },
            News: { backgroundColor: theme.colors.news },
            Dub: { backgroundColor: theme.colors.dub },
            Question: { backgroundColor: theme.colors.question },
       };
  
        return (
            <View style={[categoryStyles[category] || {}, {borderRadius: 50, height: 25, justifyContent: 'center'}]}>
                <Text style={{ color: theme.colors.text, fontWeight: 'bold', paddingHorizontal: 10 }}>{category}</Text>
            </View>
        )
    }

    if (loading) {
        return (
            <View style={styles.postsContainer}>
                <View>
                    <TouchableOpacity onPress={navigateToComments}> 
                    <View style={styles.postTopContainer}>
                        <Skeleton animation={"wave"} style={[styles.postPic, {backgroundColor: theme.colors.primary}]} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
                        <Skeleton animation={"wave"} width={100} height={25} style={{marginLeft: 10, backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
                        <View style={{flex: 1}}></View>
                        <Skeleton animation={"wave"} width={100} height={25} style={{marginLeft: 10, backgroundColor: theme.colors.primary, borderRadius: 50}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}/>
                    </View>
                    <Skeleton animation={"wave"} height={25} style={{marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
                    <Skeleton animation={"wave"} height={25} style={{marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
                    <Skeleton animation={"wave"} height={25} width={120} style={{marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
                    {props.hasImage === true && <Image style={styles.mainPic} source={require("../../assets/images/testPost.png")}/>}
                    </TouchableOpacity> 
                    <View style={styles.postBottomContainer}>
                        {/*Used to remake post on comment page without recalling db*/}
                        <Skeleton animation={"wave"} height={35} width={60} style={{backgroundColor: theme.colors.primary, borderRadius: 50}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
                        <View style={{flex: 1}}></View>
    
                        <Skeleton animation={"wave"} height={35} width={100} style={{backgroundColor: theme.colors.primary, borderRadius: 50}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>         
                    </View>
                </View>
            </View>
        )
    }
    
    return (
        <View style={styles.postsContainer}>
            {props.onComment == false ?
            <View>
                <TouchableOpacity onPress={navigateToComments}> 
                <View style={styles.postTopContainer}>
                    <Image style={styles.postPic} source={require("../../assets/images/profilepic.png")}></Image>
                    <Text style={styles.usernameAndTime}>{props.username} • {props.postedTimeAgo}</Text>
                    <View style={{flex: 1}}></View>
                    {categoryButton(props.type)}
                </View>
                <Text style={styles.subjectText}>{props.title}</Text>
                <Text style={styles.messageText}>{props.body}</Text>
                {props.hasImage === true && <Image style={styles.mainPic} source={require("../../assets/images/testPost.png")}/>}
                </TouchableOpacity> 
                <View style={styles.postBottomContainer}>
                    {/*Used to remake post on comment page without recalling db*/}
                    <TouchableOpacity onPress={navigateToComments} style={{flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 50, borderColor: theme.colors.tertiary, paddingHorizontal: 10 }}>
                        <Icon name="comments" style={{color: theme.colors.secondaryText}} size={20}/>
                        <Text style={{color: theme.colors.secondaryText, fontSize: 14, fontWeight: 'bold'}}>{props.numComments}</Text>
                    </TouchableOpacity>
                    <View style={{flex: 1}}></View>

                    <Voting postId={props.postId}/>             
                </View>
            </View> :  
            <View>
                <View> 
                    <View style={styles.postTopContainer}>
                        <Image style={styles.postPic} source={require("../../assets/images/profilepic.png")}></Image>
                        <Text style={styles.usernameAndTime}>{props.username} • {props.postedTimeAgo}</Text>
                        <View style={{flex: 1}}></View>
                        {categoryButton(props.type)}
                    </View>
                    <Text style={styles.subjectText}>{props.title}</Text>
                    <Text style={styles.messageText}>{props.body}</Text>
                    {props.hasImage === true && <Image style={styles.mainPic} source={require("../../assets/images/testPost.png")}/>}
                </View> 
                <View style={styles.postBottomContainer}>
                    {/*Used to remake post on comment page without recalling db*/}
                    <View style={{flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 50, borderColor: theme.colors.tertiary, paddingHorizontal: 10 }}>
                        <Icon name="comments" style={{color: theme.colors.secondaryText}} size={20}/>
                        <Text style={{color: theme.colors.secondaryText, fontSize: 14, fontWeight: 'bold'}}>{props.numComments}</Text>
                    </View>
                    <View style={{flex: 1}}></View>

                    <Voting postId={props.postId}/>             
                </View>
            </View>
            }
        </View>
    )
}

export default Post;
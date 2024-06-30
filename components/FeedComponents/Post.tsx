import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Image, ScrollView, Easing, Touchable, TouchableWithoutFeedback, Alert } from 'react-native';
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
import { upvotePost, downvotePost, setUpvoteStatus, setDownvoteStatus, deletePost } from '../../GlobalDataManagment/postSlice';
import { serverUrl } from '../../constants/global';
import Voting from './Voting';
import { Skeleton } from '@rneui/themed';
import useUserDetails from '../../hooks/useUserDetails';
import { storage } from '../../firebase/firebase';
import { deleteObject, getDownloadURL, ref } from 'firebase/storage';
import GameCardSkeleton from '../HomeComponents/GameCardSkeleton';


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

    const { userData } = useUserDetails();
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
            image: image //uri to image
    })
        
    }

    const [loading, setLoading] = useState(true)
    const [image, setImage] = useState<string | null>(null)
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    const yourProfileImageUri = useSelector((state:any) => state.image.profileImageUri);

    // Sets initial votes on rerender
    useEffect(() => {
        const setVote = async () => {
            try {
                if (userData) {
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
                }
            } catch (error) {
                console.error('Error getting vote status:', error);
            } finally {
                setLoading(false);
            }
        };

        setVote();
    }, [dispatch, props.postId, userData?.userID]);

    const [imageLoading, setImageLoading] = useState(true)

    const [profileImageUri, setProfileImageUri] = useState<string | null>()

    const fetchProfileImageFromFirebase = async () => {
      if (props.posterId) {
        try {
          const imageRef = ref(storage, `profileImages/${props.posterId}`);
          const url = await getDownloadURL(imageRef);
          if (url) {
            console.log('Fetched URL from Firebase:', url);
            setProfileImageUri(url)
          }
        } catch (error) {
          console.error('Error fetching profile image from Firebase:', error);
        }
      }
    };

    useEffect(() => {
        const getImageDownloadURL = async (imageName: string) => {
            try {
                const imageRef = ref(storage, `postImages/${imageName}`); // Replace 'postImages' with your actual storage folder name
                const url = await getDownloadURL(imageRef);
                // Use Image.getSize to get dimensions
                Image.getSize(url, (width, height) => {
                    setImageDimensions({ width, height });
                    setImage(url);
                    setImageLoading(false);
                }, error => {
                    console.error('Error getting image dimensions:', error);
                    setImageLoading(false);
                });
                await fetchProfileImageFromFirebase()
            } catch (error) {
                console.error('Error getting image download URL:', error);
                setImageLoading(false);
            }
        };

        if (props.hasImage && !image && !props.onComment) {
            getImageDownloadURL(props.postId);
        } else {
            setImageLoading(false);
        }
    }, [props.hasImage, props.postId, props.onComment, image]);


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

    const handleDelete = (postId:string) => {
        Alert.alert(
          'Confirm Delete',
          'Are you sure you want to delete this post?',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => performDelete(postId),
            },
          ],
          { cancelable: false }
        );
      };

      const performDelete = async (postId:string) => {
        try {
            const imgRef = ref(storage, `postImages/${postId}`);
            try {
               await deleteObject(imgRef);
               const response = await axios.post(serverUrl + '/deletePost', {
                postId: postId,
              });
              if (response.status === 200) {
                // Handle success
                if (props.onComment == true) {
                    navigation.goBack()
                }
                dispatch(deletePost(postId));
                Alert.alert('Success', 'Post deleted successfully');
                // You can update your state or UI here
                //dispatch({ type: 'DELETE_POST', payload: postId }); // Example Redux action
              } else {
                // Handle failure
                Alert.alert('Error', 'Failed to delete post');
              }
            } catch (error) {
                Alert.alert('Error', 'Failed to delete post');
                return
            }
        } catch (error) {
          console.error('Error deleting post:', error);
          Alert.alert('Error', 'Error deleting post');
        }
      };

    if ((loading || imageLoading) && props.onComment == false) {
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
                    {props.hasImage === true && <Skeleton animation={"wave"} height={width-40} width={width-40} style={{marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>}
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
                    {profileImageUri ? <Image style={styles.postPic} source={{uri: profileImageUri}}></Image> : <View style={styles.postPic}></View>}
                    <Text style={styles.usernameAndTime}>{props.username} • {props.postedTimeAgo}</Text>
                    <View style={{flex: 1}}></View>
                    {(props.posterId == userData?.userID) && 
                    <TouchableOpacity style={{paddingHorizontal: 20}} onPress={() => handleDelete(props.postId)}>
                        <Icon name="trash" size={20} color={theme.colors.text}></Icon>
                    </TouchableOpacity>
                    }
                    {categoryButton(props.type)}
                </View>
                <Text style={styles.subjectText}>{props.title}</Text>
                <Text style={styles.messageText}>{props.body}</Text>
                {props.hasImage === true && image != null && <Image style={[styles.mainPic, {aspectRatio: 1}]} source={{uri: image}}/>}
                {props.hasTempImage === true && props.image != null && props.hasImage == false && <Image style={[styles.mainPic, {aspectRatio: 1}]} source={{uri: props.image}}/>}
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
                        {props.posterId == userData?.userID && 
                        <TouchableOpacity style={{paddingHorizontal: 20}} onPress={() => {
                            handleDelete(props.postId)
                            }}>
                            <Icon name="trash" size={20} color={theme.colors.text}></Icon>
                        </TouchableOpacity>
                        }
                        {categoryButton(props.type)}
                    </View>
                    <Text style={styles.subjectText}>{props.title}</Text>
                    <Text style={styles.messageText}>{props.body}</Text>
                    <View style={styles.mainPicContainer}>
                    {props.hasImage === true && <Image style={[styles.mainPic, {aspectRatio: 1}]} source={{uri: props.image}}/>}
                    {props.hasTempImage === true && props.image != null && props.hasImage == false && <Image style={[styles.mainPic, {aspectRatio: 1}]} source={{uri: props.image}}/>}
                    </View>
                </View> 
                <View style={styles.postBottomContainer}>
                    {/*Used to remake post on comment page without recalling db*/}
                    <TouchableOpacity  style={{flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 50, borderColor: theme.colors.tertiary, paddingHorizontal: 10 }}>
                        <Icon name="comments" style={{color: theme.colors.secondaryText}} size={20}/>
                        <Text style={{color: theme.colors.secondaryText, fontSize: 14, fontWeight: 'bold'}}>{props.numComments}</Text>
                    </TouchableOpacity>
                    <View style={{flex: 1}}></View>

                    <Voting postId={props.postId}/>             
                </View>
            </View>
            }
        </View>
    )
}

export default Post;
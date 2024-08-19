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
import { deleteObject, getDownloadURL, ref } from 'firebase/storage';
import GameCardSkeleton from '../HomeComponents/GameCardSkeleton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import getProfileImage from '../../utility/getProfileImage';
import FeatherIcon from 'react-native-vector-icons/Feather';


interface PostProps extends PostType {
    postedTimeAgo: string;
    navigateToComments: () => void;
}

interface CategoryStyles {
    [key: string]: { color: string };
}

const Post = (props: any) => {

    // Layout and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width)

    const user = useSelector((state: any) => state.user);
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

    // Sets initial votes on rerender
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    const yourProfileImageUri = useSelector((state: any) => state.image.profileImageUri);
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
    const [hasDefaultProfileImage, setHasDefaultProfileImage] = useState<any>(null)

    const getPosterProfileImage = async () => {
        getProfileImage(props.posterId)
            .then(profileImageResponse => {
                if (profileImageResponse) {
                    setHasDefaultProfileImage(profileImageResponse.hasDefaultProfileImage)
                    setProfileImageUri(profileImageResponse.profileImage)
                }
            })
            .catch(error => {
                console.error("error setting profile image", error)
            })
    }
    // Fetch vote status and image simultaneously
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const newVoteStatus = await axios.post(serverUrl + '/getVoteStatus', { userID: user.userID, postId: props.postId });
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

                getPosterProfileImage()

                if (props.hasImage && !image && !props.onComment) {
                    try {
                        const imageRef = storage().ref(`postImages/${props.postId}`);
                        try {
                            const url = await imageRef.getDownloadURL();
                            if (url) {
                                setImage(url);
                            }
                        } catch (error) {
                            console.log('no firebase image');
                        }
                    } catch (error) {
                        console.error('Failed to load profile image path:', error);
                    } finally {
                        setLoading(false);
                    }
                }

                /*if (props.posterId) {
                    const posterDoc = await axios.post(`${serverUrl}/getUser`, { userID: props.posterId })
                    if (posterDoc.data.hasDefaultProfileImage = true) {
                        console.log(posterDoc.data)
                        setProfileImageUri(posterDoc.data.defaultProfileImage)
                    } else {
                        const imageRef = storage().ref(`profileImages/${props.posterId}`)
                        try {
                            const url = await imageRef.getDownloadURL();
                            if (url) {
                                setProfileImageUri(url);
                                console.log(url, "GOT POST IMAGE")
                            }
                        } catch (error) {
                            console.log('no firebase image');
                        }
                        // const profileImageRef = ref(storage, `profileImages/${props.posterId}`);
                        // const profileUrl = await getDownloadURL(profileImageRef);
                        //setProfileImageUri(profileUrl);
                    }
                }*/
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch, props.postId, props.hasImage, props.posterId, user]);

    const categoryButton = (category: string) => {

        const categoryStyles: CategoryStyles = {
            Discussion: { color: theme.colors.discussion },
            Meme: { color: theme.colors.meme },
            News: { color: theme.colors.news },
            Dub: { color: theme.colors.dub },
            Question: { color: theme.colors.question },
        };

        return (

            <Text style={[categoryStyles[category] || {}, { fontWeight: 'bold', paddingHorizontal: 10, fontSize: 10 }]}>{category}</Text>

        )
    }

    const handleDelete = (postId: string) => {
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

    const performDelete = async (postId: string) => {
        try {

            try {
                if (props.hasImage == true || props.hasTempImage == true) {
                    // const imgRef = ref(storage, `postImages/${postId}`);
                    // await deleteObject(imgRef);
                }
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
                console.log(error)
                return
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Error deleting post');
        }
    };

    const [aspectRatio, setAspectRatio] = useState<any>(null)

    useEffect(() => {
        if (image) {
            console.log(image)
            Image.getSize(image, (width, height) => {
                setAspectRatio(width / height);
            });
        }
    }, [image]);

    /*if (loading && props.onComment == false) {
        return (
            <View style={styles.postsContainer}>
                <View>
                    <TouchableOpacity onPress={navigateToComments}>
                        <View style={styles.postTopContainer}>
                            <Skeleton animation={"wave"} style={[styles.postPic, { backgroundColor: theme.colors.primary }]} skeletonStyle={{ backgroundColor: theme.colors.tertiary }}></Skeleton>
                            <Skeleton animation={"wave"} width={100} height={25} style={{ marginLeft: 10, backgroundColor: theme.colors.primary, borderRadius: 5 }} skeletonStyle={{ backgroundColor: theme.colors.tertiary }}></Skeleton>
                            <View style={{ flex: 1 }}></View>
                            <Skeleton animation={"wave"} width={100} height={25} style={{ marginLeft: 10, backgroundColor: theme.colors.primary, borderRadius: 50 }} skeletonStyle={{ backgroundColor: theme.colors.tertiary }} />
                        </View>
                        <Skeleton animation={"wave"} height={25} style={{ marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 5 }} skeletonStyle={{ backgroundColor: theme.colors.tertiary }}></Skeleton>
                        <Skeleton animation={"wave"} height={25} style={{ marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 5 }} skeletonStyle={{ backgroundColor: theme.colors.tertiary }}></Skeleton>
                        <Skeleton animation={"wave"} height={25} width={120} style={{ marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 5 }} skeletonStyle={{ backgroundColor: theme.colors.tertiary }}></Skeleton>
                        {props.hasImage === true && <Skeleton animation={"wave"} height={width - 40} width={width - 40} style={{ marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 5 }} skeletonStyle={{ backgroundColor: theme.colors.tertiary }}></Skeleton>}
                    </TouchableOpacity>
                    <View style={styles.postBottomContainer}>
                        <Skeleton animation={"wave"} height={35} width={60} style={{ backgroundColor: theme.colors.primary, borderRadius: 50 }} skeletonStyle={{ backgroundColor: theme.colors.tertiary }}></Skeleton>
                        <View style={{ flex: 1 }}></View>

                        <Skeleton animation={"wave"} height={35} width={100} style={{ backgroundColor: theme.colors.primary, borderRadius: 50 }} skeletonStyle={{ backgroundColor: theme.colors.tertiary }}></Skeleton>
                    </View>
                </View>
            </View>
        )
    }*/

    return (
        <View style={styles.postsContainer}>
            {props.onComment == false ?
                <View>
                    <TouchableOpacity onPress={() => props.expandCommentSheet(props.postId)}>
                        <View style={styles.postTopContainer}>

                            {hasDefaultProfileImage == true && profileImageUri && (
                                <Image
                                    style={[
                                        { width: 30, height: 30, borderRadius: 100 },
                                    ]}
                                    source={profileImageUri as any}
                                />
                            )}
                            {hasDefaultProfileImage == false && profileImageUri && (
                                <Image
                                    style={[
                                        { width: 30, height: 30, borderRadius: 100 },
                                    ]}
                                    source={{ uri: profileImageUri } as any}
                                />
                            )}
                            {!profileImageUri && props.profileImage && props.hasTempProfileImage && (
                                <Image style={styles.postPic} source={{ uri: props.profileImage }} />
                            )
                            }
                            <View>
                                <Text style={styles.usernameAndTime}>{props.username} • {props.postedTimeAgo}</Text>
                                {categoryButton(props.type)}
                            </View>
                            <View style={{ flex: 1 }}></View>
                            {((props.posterId == user.userID) || props.hasTempImage || props.profileImage) &&
                                <TouchableOpacity onPress={() => handleDelete(props.postId)}>
                                    <Icon name="trash" size={18} color={theme.colors.secondaryText}></Icon>
                                </TouchableOpacity>
                            }
                        </View>
                        <View style={{ marginHorizontal: 15 }}>
                            <Text style={styles.subjectText}>{props.title}</Text>
                            <Text style={styles.messageText}>{props.body}</Text>
                        </View>
                        {props.hasImage === true && image != null && <Image
                            style={[styles.mainPic, { width: '100%', aspectRatio }]}
                            source={{ uri: image }}
                            resizeMode="contain" // or "cover"
                        />}
                        {props.hasTempImage === true && props.image != null && props.hasImage == false && <Image style={[styles.mainPic, { width: '100%', aspectRatio: props.aspectRatio }]} source={{ uri: props.image }} />}
                    </TouchableOpacity>
                    <View>
                        <View style={styles.postBottomContainer}>
                            {/*Used to remake post on comment page without recalling db*/}
                            <TouchableOpacity
                                onPress={() => {
                                    props.expandCommentSheet(props.postId);  // Correctly invoke the function

                                    console.log('expandCommentSheet called');
                                }}
                                style={{
                                    flexDirection: 'row',
                                    gap: 10,
                                    alignItems: 'center',
                                    backgroundColor: theme.colors.secondary,
                                    borderColor: theme.colors.tertiary,
                                    borderWidth: 2,
                                    borderRadius: 50,
                                    paddingHorizontal: 10
                                }}
                            >
                                <Icon name="comments" style={{ color: theme.colors.opposite }} size={18} />
                                <Text style={{ color: theme.colors.opposite, fontSize: 14, fontWeight: 'bold' }}>{props.numComments}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: theme.colors.secondary, borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 50, paddingHorizontal: 10 }}>
                                <FeatherIcon name="send" size={18} color={theme.colors.opposite} />
                                <Text style={{ color: theme.colors.opposite, fontSize: 14, fontWeight: 'bold' }}>DM</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}></View>

                            <Voting postId={props.postId} />
                        </View>
                        <View>

                        </View>

                    </View>

                </View> :
                <View>
                    <View>
                        <View style={styles.postTopContainer}>
                            <Image style={styles.postPic} source={require("../../assets/images/profilepic.png")}></Image>
                            <View>
                                <Text style={styles.usernameAndTime}>{props.username} • {props.postedTimeAgo}</Text>
                                {categoryButton(props.type)}
                            </View>
                            <View style={{ flex: 1 }}></View>
                            {props.posterId == user.userID &&
                                <TouchableOpacity onPress={() => {
                                    handleDelete(props.postId)
                                }}>
                                    <Icon name="trash" size={18} color={theme.colors.secondaryText}></Icon>
                                </TouchableOpacity>
                            }
                        </View>
                        <View style={{ marginHorizontal: 15 }}>
                            <Text style={styles.subjectText}>{props.title}</Text>
                            <Text style={styles.messageText}>{props.body}</Text>
                        </View>
                        <View style={styles.mainPicContainer}>
                            {props.hasImage === true && <Image
                                style={[styles.mainPic, { width: '100%', height: undefined }]}
                                source={{ uri: props.image }}
                                resizeMode="contain" // or "cover" depending on your needs
                            />}
                            {props.hasTempImage === true && props.image != null && props.hasImage == false && <Image style={[styles.mainPic, { aspectRatio: 1 }]} source={{ uri: props.image }} />}
                        </View>
                    </View>
                    <View style={styles.postBottomContainer}>
                        {/*Used to remake post on comment page without recalling db*/}
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 2, borderRadius: 50, borderColor: theme.colors.tertiary, paddingHorizontal: 10, backgroundColor: theme.colors.secondary }}>
                            <Icon name="comments" style={{ color: theme.colors.opposite }} size={20} />
                            <Text style={{ color: theme.colors.opposite, fontSize: 14, fontWeight: 'bold' }}>{props.numComments}</Text>
                        </View>
                        <TouchableOpacity style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: theme.colors.secondary, borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 50, paddingHorizontal: 10 }}>
                            <FeatherIcon name="send" size={18} color={theme.colors.opposite} />
                            <Text style={{ color: theme.colors.opposite, fontSize: 14, fontWeight: 'bold' }}>DM</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}></View>

                        <Voting postId={props.postId} />
                    </View>
                </View>
            }
        </View>
    )
}

export default Post;
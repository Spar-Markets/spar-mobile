import React, { useEffect, useRef, useState } from 'react';
import { View, Image, TextInput, Text, FlatList, ListRenderItem, RefreshControl } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Gap from '../HomeComponents/Gap';
import Post from '../FeedComponents/Post';
import { useNavigation } from '@react-navigation/native';
import PostType from '../../types/PostType';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import timeAgo from '../../utility/timeAgo';
import LinearGradient from 'react-native-linear-gradient';
import CommentSheet from '../FeedComponents/CommentSheet';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { setSelectedPost } from '../../GlobalDataManagment/commentSheetSlice';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { appendPosts, setPosts } from '../../GlobalDataManagment/yourPostsSlice';


interface YourPostsProps {
    onScrollDown?: () => void; // Add this prop to handle the scroll down event
}

const YourPosts: React.FC<YourPostsProps> = ({ onScrollDown }) => {
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width);

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    //const posts = useSelector((state: RootState) => state.posts || []);
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const user = useSelector((state: any) => state.user);
    const [loading, setLoading] = useState(false); // Single loading state for fetches
    const [skip, setSkip] = useState(0);
    const [hasMorePosts, setHasMorePosts] = useState(true);

    const yourPosts = useSelector((state: RootState) => state.yourPosts)


    useEffect(() => {
        console.log(yourPosts)
    }, [])


    const fetchPosts = async (reset = false) => {
        if (loading) return; // Prevent new fetch if already loading
        setLoading(true);

        try {
            const response = await axios.get(`${serverUrl}/postsByUser`, {
                params: {
                    userID: user.userID, // Fetch posts by the current user's ID
                    limit: 100,
                    skip: reset ? 0 : skip
                }
            });

            const fetchedPosts: PostType[] = response.data.posts.map((post: PostType) => ({
                ...post,
                postedTimeAgo: timeAgo(new Date(post.postedTime))
            }));

            if (reset) {
                dispatch(setPosts(fetchedPosts))
                //console.log(fetchedPosts)
                setSkip(100); // Reset skip to the next batch
            } else {
                const newPosts = fetchedPosts.filter(fp => !yourPosts.some((p: any) => p.postId === fp.postId));
                console.log(newPosts)
                dispatch(appendPosts(newPosts));
                setSkip(prevSkip => prevSkip + 100); // Increase skip for the next batch
            }

            if (fetchedPosts.length < 100) {
                setHasMorePosts(false); // No more posts to fetch
            } else {
                setHasMorePosts(true); // There are more posts to fetch
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(true); // Fetch posts with reset on component mount
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        setSkip(0); // Reset skip before fetching
        await fetchPosts(true); // Fetch posts with reset on refresh
        setRefreshing(false);
    };

    const loadMorePosts = async () => {
        if (!loading && hasMorePosts) {
            await fetchPosts(); // Fetch more posts without reset
        }
    };

    const renderItem: ListRenderItem<PostType> = ({ item }) => {
        return (
            <View key={item.postId}>
                <Post {...item} onComment={false} expandCommentSheet={expandCommentSheet} onYourPosts={true} />
            </View>
        );
    };

    const commentSheetRef = useRef<BottomSheet>(null);

    const expandCommentSheet = (postId: string) => {
        dispatch(setSelectedPost(postId))
        commentSheetRef.current?.expand();
    };

    const selectedPost = useSelector((state: RootState) => state.commentSheet.selectedPost)

    useEffect(() => {
        if (selectedPost == null) {
            commentSheetRef.current?.close()
        }
    }, [selectedPost])

    const previousYOffset = useRef(0); // Initialize ref to track the previous Y offset


    const handleScroll = (event: any) => {
        const yOffset = event.nativeEvent.contentOffset.y;

        if (yOffset > previousYOffset.current) {
            if (onScrollDown) {
                onScrollDown(); // Call the passed function when scrolling down
            }
        }

        previousYOffset.current = yOffset;
    };


    if (loading) {
        return <View />
    }



    return (
        <>
            <View style={{ flex: 1, width: width }}>
                <FlatList
                    data={yourPosts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.postId}
                    contentContainerStyle={{ marginTop: 10 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.accent]}
                            tintColor={theme.colors.accent}
                        />
                    }
                    ItemSeparatorComponent={() => <View style={{ marginVertical: 10, height: 5, backgroundColor: theme.colors.secondary }} />}
                    onEndReached={loadMorePosts}
                    onEndReachedThreshold={0.5}
                    onScroll={handleScroll} // Add the onScroll prop here
                    scrollEventThrottle={16} // Controls the frequency of onScroll events, set to 16ms for smooth handling



                />

            </View>

            <CommentSheet ref={commentSheetRef} />

        </>
    );
};

export default YourPosts;

import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Post from '../FeedComponents/Post';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import timeAgo from '../../utility/timeAgo';
import CommentSheet from '../FeedComponents/CommentSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { setSelectedPost } from '../../GlobalDataManagment/commentSheetSlice';
import PostType from '../../types/PostType';
import { appendPosts, setPosts } from '../../GlobalDataManagment/likedPostsSlice';

const LikedPosts: React.FC = () => {
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createFeedStyles(theme, width);

    const [refreshing, setRefreshing] = useState<boolean>(false);
    //const posts = useSelector((state: RootState) => state.posts || []);
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState<boolean>(false);
    const [skip, setSkip] = useState<number>(0);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);

    const posts = useSelector((state: RootState) => state.likedPosts)


    const fetchPosts = async (reset = false) => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await axios.get(`${serverUrl}/upvotedPostsByUser`, {
                params: {
                    userID: user.userID, // Fetch upvoted posts by the current user's ID
                    limit: 100,
                    skip: reset ? 0 : skip
                }
            });

            const fetchedPosts: PostType[] = response.data.posts.map((post: PostType) => ({
                ...post,
                postedTimeAgo: timeAgo(new Date(post.postedTime))
            }));

            if (reset) {
                dispatch(setPosts(fetchedPosts));
                setSkip(100); // Reset skip to the next batch
            } else {
                const newPosts = fetchedPosts.filter(fp => !posts.some((p: any) => p.postId === fp.postId));
                dispatch(appendPosts(newPosts));
                setSkip(prevSkip => prevSkip + 100);
            }

            if (fetchedPosts.length < 100) {
                setHasMorePosts(false); // No more posts to fetch
            } else {
                setHasMorePosts(true); // There are more posts to fetch
            }
        } catch (error) {
            console.error("Error fetching liked posts:", error);
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
                <Post {...item} onComment={false} expandCommentSheet={expandCommentSheet} />
            </View>
        );
    };

    const commentSheetRef = useRef<BottomSheet>(null);

    const expandCommentSheet = (postId: string) => {
        dispatch(setSelectedPost(postId));
        commentSheetRef.current?.expand();
    };

    const selectedPost = useSelector((state: RootState) => state.commentSheet.selectedPost);

    useEffect(() => {
        if (selectedPost == null) {
            commentSheetRef.current?.close();
        }
    }, [selectedPost]);

    if (loading) {
        return <View />
    }

    return (
        <>
            <View style={{ flex: 1, width: width }}>
                <FlatList
                    data={posts}
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
                    showsVerticalScrollIndicator={false}

                />
            </View>

            <CommentSheet ref={commentSheetRef} />
        </>
    );
};

export default LikedPosts;

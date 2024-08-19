import React, { useEffect, useRef, useState } from 'react';
import { View, Image, TextInput, Text, FlatList, ListRenderItem, RefreshControl } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Gap from '../HomeComponents/Gap';
import Post from './Post';
import { useNavigation } from '@react-navigation/native';
import PostType from '../../types/PostType';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { appendPosts, setPosts } from '../../GlobalDataManagment/postSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import timeAgo from '../../utility/timeAgo';
import LinearGradient from 'react-native-linear-gradient';
import CommentSheet from './CommentSheet';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { setSelectedPost } from '../../GlobalDataManagment/commentSheetSlice';
import DmFriends from './DmFriends';

const Feed: React.FC = () => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createFeedStyles(theme, width);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const posts = useSelector((state: RootState) => state.posts || []);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.user);
  const [loading, setLoading] = useState(false); // Single loading state for fetches
  const [skip, setSkip] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const profileImageUri = useSelector((state: any) => state.image.profileImageUri);

  useEffect(() => {
    console.log(user.friends)
  }, [])


  const fetchPosts = async (reset = false) => {
    if (loading) return; // Prevent new fetch if already loading
    setLoading(true);

    try {

      const response = await axios.get(`${serverUrl}/posts`, {
        params: { limit: 100, skip: reset ? 0 : skip }
      });

      const fetchedPosts: PostType[] = response.data.posts.map((post: PostType) => ({
        ...post,
        postedTimeAgo: timeAgo(new Date(post.postedTime))
      }));

      if (reset) {
        dispatch(setPosts(fetchedPosts));
        setSkip(100); // Reset skip to the next batch
      } else {
        console.log(posts)
        const newPosts = fetchedPosts.filter(fp => !posts.some(p => p.postId === fp.postId));
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
        <Post {...item} onComment={false} expandCommentSheet={expandCommentSheet} />
      </View>
    );
  };

  const commentSheetRef = useRef<BottomSheet>(null);

  const expandCommentSheet = (postId: string) => {
    dispatch(setSelectedPost(postId))
    commentSheetRef.current?.expand();
  };



  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text
            style={{
              color: theme.colors.text,
              fontFamily: 'InterTight-Bold',
              fontSize: 25,
            }}>
            Community
          </Text>
        </View>
        {/*<View style={styles.header}>
          {profileImageUri ? <Image style={styles.profilePic} source={{ uri: profileImageUri }} /> :
            <View style={styles.profilePic}>
            </View>}
          <View style={styles.searchSection}>
            <Icon name="search" style={{ color: theme.colors.tertiary }} size={24} />
            <TextInput
              placeholder="Search Posts, People..."
              placeholderTextColor={theme.colors.tertiary}
              onChangeText={setSearchQuery}
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={styles.searchInputContainer}
              selectionColor={theme.colors.accent}
            />
            <View style={{ flex: 1 }}></View>
          </View>
        </View>*/}
        <DmFriends />
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.postId}
          contentContainerStyle={{ paddingBottom: 100, marginTop: 10 }}
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

        <View style={{ position: 'absolute', right: 10, bottom: 0, zIndex: 100 }}>
          <TouchableOpacity
            style={{
              marginVertical: 10,
              height: 60,
              width: 60,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 500,
              zIndex: 100, // Ensure this is on top
            }}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <LinearGradient
              colors={[theme.colors.stockUpAccent, theme.colors.darkAccent]}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 500,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="plus" size={24} color={theme.colors.opposite} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <CommentSheet ref={commentSheetRef} />

    </>
  );
};

export default Feed;

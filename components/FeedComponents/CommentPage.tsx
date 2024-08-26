import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Keyboard, Animated, KeyboardEvent, Alert } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import generateRandomString from '../../utility/generateRandomString';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { addCommentToPost, clearCommentsForPost, setCommentsForPost } from '../../GlobalDataManagment/postSlice';
import CommentType from '../../types/CommentType';
import Post from './Post';
import Comment from './Comment';
import CommentGap from './CommentGap';
import Gap from '../HomeComponents/Gap';
import timeAgo from '../../utility/timeAgo';

// Expected format of post
interface RouteParams {
  postId: string;
  username: string;
  postedTime: string;
  type: string;
  title: string;
  body: string;
  numComments: number;
  numReposts: number;
  votes: number;
  hasImage: boolean;
  isUpvoted: boolean;
  isDownvoted: boolean;
  image: string
}

const CommentPage = () => {
  // Layout and Style Initialization
  const { theme } = useTheme();
  const { width } = useDimensions();
  const styles = createFeedStyles(theme, width);
  const route = useRoute();
  const params = route.params as RouteParams | undefined;

  const user = useSelector((state: RootState) => state.user)

  const post = useSelector((state: RootState) =>
    state.posts.find((p) => p.postId === params?.postId)
  );

  const dispatch = useDispatch();
  const [commentInput, setCommentInput] = useState('');

  const animatedMargin = useRef(new Animated.Value(70)).current;

  const confirmComment = async () => {

    try {
      const commentId = generateRandomString(40);
      const localCommentData: CommentType = {
        commentId: commentId,
        postId: params!.postId,
        username: user.username!,
        userID: user.userID!,
        postedTime: new Date(Date.now()),
        body: commentInput,
        votes: 0,
        isUpvoted: false,
        isDownvoted: false,
        postedTimeAgo: "",
        replies: []
      };

      const mongoCommentData = {
        postId: params!.postId,
        commentId: commentId,
        username: user.username!,
        userID: user.userID!,
        postedTime: Date.now(),
        body: commentInput,
      };

      const response = await axios.post(serverUrl + '/commentOnPost', mongoCommentData);
      console.log(response.data);

      if (response.status === 200) {
        dispatch(addCommentToPost({ postId: params!.postId, comment: localCommentData }));
        setCommentInput('');
        Keyboard.dismiss()
      } else {
        Alert.alert('Error', 'Failed to Comment');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const commentInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (commentInputRef.current) {
      commentInputRef.current.focus(); // Focus the TextInput when the component mounts
    }
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.post(`${serverUrl}/getComments`, { postId: params?.postId });
        const comments: CommentType[] = response.data.comments.map((comment: any) => ({
          ...comment,
          postedTimeAgo: timeAgo(new Date(comment.postedTime))
        }));
        console.log(comments)
        dispatch(setCommentsForPost({ postId: params!.postId, comments }));
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();

    return () => {
      dispatch(clearCommentsForPost(params!.postId));
    };
  }, [params, dispatch]);

  //keyboard animation
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', (event: KeyboardEvent) => {
      Animated.spring(animatedMargin, {
        toValue: event.endCoordinates.height + 20, // Add extra space here
        speed: 14,
        bounciness: 1,
        useNativeDriver: false
      }).start();
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', () => {
      Animated.spring(animatedMargin, {
        toValue: 70, // Keep some space at the bottom when keyboard is hidden
        speed: 14,
        bounciness: 1,
        useNativeDriver: false
      }).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);



  const renderItem = ({ item }: { item: CommentType }) => (
    <View>
      <Comment {...item} />
      <View style={{ height: 10 }}></View>
      <CommentGap />
    </View>
  );


  return (
    <View style={styles.commentsContainer}>
      <PageHeader text="Comments" />

      {/* skeleton code for loading */}
      <FlatList
        data={post?.comments ? post?.comments.slice().reverse() : []}
        renderItem={renderItem}
        keyExtractor={(item) => item.commentId}
        keyboardDismissMode='on-drag'
        contentContainerStyle={{ flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            {params?.image ? <Post {...post} onComment={true} image={params?.image} /> : <Post {...post} onComment={true} />}
            <View style={{ height: 6, backgroundColor: theme.colors.primary, marginTop: 10 }}></View>
          </View>}
      />
      <Animated.View style={[{ flexDirection: 'row', marginBottom: 50, borderTopWidth: 1, borderColor: theme.colors.accent }, { marginBottom: animatedMargin }]}>
        <TextInput
          ref={commentInputRef}
          placeholder="Comment something..."
          placeholderTextColor={theme.colors.tertiary}
          onChangeText={setCommentInput}
          value={commentInput}
          style={[styles.commentInputContainer, { flex: 1 }]}
          selectionColor={theme.colors.accent}
          maxLength={250}
          multiline
        />
        {commentInput.length > 0 ? (
          <TouchableOpacity style={styles.postButton} onPress={confirmComment}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.postButton, { backgroundColor: theme.colors.tertiary }]}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default CommentPage;

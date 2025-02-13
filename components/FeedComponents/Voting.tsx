import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, TouchableOpacity, Animated, Text, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { upvotePost, downvotePost, setUpvoteStatus, setDownvoteStatus } from '../../GlobalDataManagment/postSlice';
import { upvotePost as upvoteYourPost, downvotePost as downvoteYourPost, setUpvoteStatus as setYourUpvoteStatus, setDownvoteStatus as setYourDownvoteStatus } from '../../GlobalDataManagment/yourPostsSlice';
import { upvotePost as upvoteLikedPost, downvotePost as downvoteLikedPost, setUpvoteStatus as setLikedUpvoteStatus, setDownvoteStatus as setLikedDownvoteStatus } from '../../GlobalDataManagment/likedPostsSlice';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import HapticFeedback from "react-native-haptic-feedback";


const Voting: React.FC<{ postId: string, onYourPosts: boolean }> = ({ postId, onYourPosts }) => {
  const dispatch = useDispatch();
  const post = useSelector((state: any) => onYourPosts ? state.yourPosts.find((p: any) => p.postId === postId) : state.posts.find((p: any) => p.postId === postId), shallowEqual);
  const user = useSelector((state: any) => state.user);



  const upvotePosition = useRef(new Animated.Value(0)).current;
  const downvotePosition = useRef(new Animated.Value(0)).current;

  const { theme } = useTheme();
  const { width } = useDimensions();
  const styles = createFeedStyles(theme, width);

  const animateButton = useCallback((buttonPosition: Animated.Value, direction: 'up' | 'down') => {
    const toValue = direction === 'up' ? -10 : 10;
    Animated.sequence([
      Animated.timing(buttonPosition, {
        toValue,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(buttonPosition, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    console.log("text", post)
  }, [])

  const upvote = useCallback(async () => {
    HapticFeedback.trigger("impactMedium", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false
    });
    console.log("Upvoted");
    if (!post.isUpvoted) {
      animateButton(upvotePosition, 'up');
    }
    if (onYourPosts) {
      dispatch(upvoteYourPost(post.postId))
    } else {
      dispatch(upvotePost(post.postId));
    }
    try {
      const response = await axios.post(serverUrl + "/upvotePost", { userID: user.userID, postId: post.postId });
      console.log("Response:", response.data);
    } catch (error) {
      console.log("error upvoting in mongo", error);
    }
  }, [animateButton, dispatch, post.isUpvoted, post.postId, upvotePosition, user.userID]);

  const downvote = useCallback(async () => {
    HapticFeedback.trigger("impactMedium", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false
    });
    console.log("DOWNVOTED");
    if (!post.isDownvoted) {
      animateButton(downvotePosition, 'down');
    }
    if (onYourPosts) {
      dispatch(downvoteYourPost(post.postId))
    }
    else {
      dispatch(downvotePost(post.postId));
    }
    try {
      const response = await axios.post(serverUrl + "/downvotePost", { userID: user.userID, postId: post.postId });
      console.log("Response:", response.data);
    } catch {
      console.log("error downvoting in mongo");
    }
  }, [animateButton, dispatch, downvotePosition, post.isDownvoted, post.postId, user.userID]);


  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 2, backgroundColor: theme.colors.secondary, borderRadius: 50, borderColor: theme.colors.tertiary, paddingHorizontal: 10, height: 35 }}>
      <TouchableOpacity onPress={upvote} style={{ paddingRight: 10 }}>
        <Animated.View style={{ transform: [{ translateY: upvotePosition }] }}>
          <Icon name="arrow-up" style={post.isUpvoted ? { color: theme.colors.stockUpAccent } : { color: theme.colors.secondaryText }} size={20} />
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.votesText}>{post.votes}</Text>
      <TouchableOpacity onPress={downvote} style={{ paddingLeft: 10 }}>
        <Animated.View style={{ transform: [{ translateY: downvotePosition }] }}>
          <Icon name="arrow-down" style={post?.isDownvoted ? { color: theme.colors.stockDownAccent } : { color: theme.colors.secondaryText }} size={20} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(Voting);

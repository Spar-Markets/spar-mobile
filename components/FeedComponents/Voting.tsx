import React, { useRef, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Animated, Text, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { upvotePost, downvotePost, setUpvoteStatus, setDownvoteStatus } from '../../GlobalDataManagment/postSlice';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import HapticFeedback from "react-native-haptic-feedback";

const Voting: React.FC<{ postId: string }> = ({ postId }) => {
  const dispatch = useDispatch();
  const post = useSelector((state: any) => state.posts.find((p: any) => p.postId === postId), shallowEqual);
  const userData = useSelector((state: any) => state.user.userData, shallowEqual);

  const upvotePosition = useRef(new Animated.Value(0)).current;
  const downvotePosition = useRef(new Animated.Value(0)).current;

  const { theme } = useTheme();
  const { width } = useDimensions();
  const styles = createFeedStyles(theme, width);

  // Sets initial votes on rerender
  useEffect(() => {
    const setVote = async () => {
      try {
        const newVoteStatus = await axios.post(serverUrl + '/getVoteStatus', { uid: userData.userID, postId: postId });
        if (newVoteStatus.data.voteType === 'up') {
          dispatch(setUpvoteStatus({ postId, isUpvoted: true }));
          dispatch(setDownvoteStatus({ postId, isDownvoted: false }));
        } else if (newVoteStatus.data.voteType === 'down') {
          dispatch(setUpvoteStatus({ postId, isUpvoted: false }));
          dispatch(setDownvoteStatus({ postId, isDownvoted: true }));
        } else {
          dispatch(setUpvoteStatus({ postId, isUpvoted: false }));
          dispatch(setDownvoteStatus({ postId, isDownvoted: false }));
        }
      } catch (error) {
        console.error('Error getting vote status:', error);
      }
    };

    setVote();
  }, [dispatch, postId, userData.userID]);

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

  const upvote = useCallback(async () => {
    HapticFeedback.trigger("impactMedium", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false
    });
    console.log("Upvoted");
    if (!post.isUpvoted) {
      animateButton(upvotePosition, 'up');
    }
    dispatch(upvotePost(post.postId));
    try {
      const response = await axios.post(serverUrl + "/upvotePost", { uid: userData.userID, postId });
      console.log("Response:", response.data);
    } catch (error) {
      console.log("error upvoting in mongo", error);
    }
  }, [animateButton, dispatch, post.isUpvoted, post.postId, upvotePosition, userData.userID]);

  const downvote = useCallback(async () => {
    HapticFeedback.trigger("impactMedium", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false
    });
    console.log("DOWNVOTED");
    if (!post.isDownvoted) {
      animateButton(downvotePosition, 'down');
    }
    dispatch(downvotePost(post.postId));
    try {
      const response = await axios.post(serverUrl + "/downvotePost", { uid: userData.userID, postId: post.postId });
    } catch {
      console.log("error downvoting in mongo");
    }
  }, [animateButton, dispatch, downvotePosition, post.isDownvoted, post.postId, userData.userID]);

  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 50, borderColor: theme.colors.tertiary, paddingHorizontal: 10, paddingVertical: 5 }}>
      <TouchableOpacity onPress={upvote} style={{paddingRight: 10}}>
        <Animated.View style={{ transform: [{ translateY: upvotePosition }] }}>
          <Icon name="arrow-up" style={post.isUpvoted ? { color: theme.colors.stockUpAccent } : { color: theme.colors.secondaryText }} size={20} />
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.votesText}>{post.votes}</Text>
      <TouchableOpacity onPress={downvote} style={{paddingLeft: 10}}>
        <Animated.View style={{ transform: [{ translateY: downvotePosition }] }}>
          <Icon name="arrow-down" style={post?.isDownvoted ? { color: theme.colors.stockDownAccent } : { color: theme.colors.secondaryText }} size={20} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(Voting);

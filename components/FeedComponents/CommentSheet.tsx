import React, { useRef, forwardRef, useCallback, useEffect, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../ContextComponents/ThemeContext';
import { Alert, FlatList, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import CommentType from '../../types/CommentType';
import timeAgo from '../../utility/timeAgo';
import { useDispatch, useSelector } from 'react-redux';
import { addCommentToPost, clearCommentsForPost, setCommentsForPost } from '../../GlobalDataManagment/postSlice';
import Comment from './Comment';
import { RootState } from '../../GlobalDataManagment/store';
import generateRandomString from '../../utility/generateRandomString';
import Post from './Post';
import * as Progress from 'react-native-progress';
import { setSelectedPost, setSelectedPostImageData } from '../../GlobalDataManagment/commentSheetSlice';


const CommentSheet = forwardRef<BottomSheet>((props, ref) => {
    const { theme } = useTheme();
    const user = useSelector((state: any) => state.user);
    const dispatch = useDispatch();

    const selectedPostId = useSelector((state: RootState) => state.commentSheet.selectedPost)
    const selectedPostImage = useSelector((state: RootState) => state.commentSheet.selectedPostImageData)

    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);


    const post = useSelector((state: RootState) =>
        state.posts.find((p) => p.postId === selectedPostId)
    );

    useEffect(() => {
        console.log("selected post", post, selectedPostImage)
    }, [selectedPostId])

    const fetchComments = async () => {
        try {
            if (selectedPostId) {
                setLoading(true);
                const response = await axios.post(`${serverUrl}/getComments`, { postId: selectedPostId });
                const comments: CommentType[] = response.data.comments.map((comment: any) => ({
                    ...comment,
                    postedTimeAgo: timeAgo(new Date(comment.postedTime)),
                }));
                dispatch(setCommentsForPost({ postId: selectedPostId, comments }));
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSheetChanges = useCallback((index: number) => {
        if (index === 0) {
            fetchComments();
        } else if (index === -1) {
            setLoading(true)
            dispatch(setSelectedPost(null))
            dispatch(setSelectedPostImageData(null))
            dispatch(clearCommentsForPost(selectedPostId!));
        }
    }, [selectedPostId]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.4}
            >
                <View style={{ backgroundColor: theme.colors.opposite, flex: 1, zIndex: 0 }} />
            </BottomSheetBackdrop>
        ),
        [theme.colors.opposite]
    );

    const renderItem = ({ item }: { item: CommentType }) => (
        <Comment {...item} />
    );

    const confirmComment = async () => {
        if (comment == "") {
            return
        }
        try {
            const commentId = generateRandomString(40);
            const localCommentData: CommentType = {
                commentId,
                postId: selectedPostId!,
                username: user.username!,
                userID: user.userID!,
                postedTime: new Date(Date.now()),
                body: comment,
                votes: 0,
                isUpvoted: false,
                isDownvoted: false,
                postedTimeAgo: '',
                replies: [],
            };

            const mongoCommentData = {
                postId: selectedPostId,
                commentId,
                username: user.username!,
                userID: user.userID!,
                postedTime: Date.now(),
                body: comment,
            };

            const response = await axios.post(serverUrl + '/commentOnPost', mongoCommentData);
            if (response.status === 200) {
                dispatch(addCommentToPost({ postId: selectedPostId!, comment: localCommentData }));
                Keyboard.dismiss();
                setComment('');
            } else {
                Alert.alert('Error', 'Failed to Comment');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <BottomSheet
            ref={ref}
            snapPoints={['90%']}
            index={-1}
            enablePanDownToClose
            onAnimate={(fromIndex, toIndex) => {
                if (toIndex < fromIndex) {
                    // If the bottom sheet is moving down, dismiss the keyboard
                    Keyboard.dismiss();
                }
            }}
            onChange={handleSheetChanges}
            backgroundStyle={{ backgroundColor: theme.colors.background }}
            handleIndicatorStyle={{ backgroundColor: theme.colors.secondaryText }}
            backdropComponent={renderBackdrop}
            style={{ zIndex: 100 }}
        >
            <BottomSheetView style={{ flex: 1 }}>
                {selectedPostId != null &&
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
                    >
                        <Text style={{ color: theme.colors.text, textAlign: 'center', fontFamily: 'Intertight-bold' }}>Comments</Text>
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={loading ? [] : post?.comments ? post.comments.slice().reverse() : []}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.commentId}
                                keyboardDismissMode="on-drag"
                                contentContainerStyle={{ flexGrow: 1 }}
                                ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
                                ListHeaderComponent={
                                    <View>

                                        <Post {...post} onComment={true} />

                                        <View style={{ height: 6, backgroundColor: theme.colors.primary, marginTop: 10 }} />
                                    </View>
                                }
                                ListEmptyComponent={() => (
                                    loading ? (
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                            <Progress.CircleSnail color={[theme.colors.accent, theme.colors.accent2]} />
                                        </View>
                                    ) : (
                                        <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondaryText }}>
                                            No comments yet.
                                        </Text>
                                    )
                                )}
                                style={{ marginVertical: 15 }}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', marginHorizontal: 20, alignItems: 'flex-end' }}>
                            <TextInput
                                placeholder="Add a comment..."
                                placeholderTextColor={theme.colors.secondaryText}
                                onChangeText={setComment}
                                value={comment}
                                style={{
                                    borderWidth: 1,
                                    borderColor: theme.colors.tertiary,
                                    minHeight: 40,
                                    borderRadius: 20,
                                    color: theme.colors.opposite,
                                    flex: 1,
                                    paddingHorizontal: 15,
                                    fontSize: 12,
                                    paddingTop: 12,
                                }}
                                selectionColor={theme.colors.accent}
                                multiline
                            />
                            {comment == "" || comment == null ?
                                <View
                                    style={{
                                        marginLeft: 10,
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: theme.colors.secondary,
                                    }}>
                                    <FeatherIcon name="send" size={20} color={theme.colors.secondaryText} />
                                </View> :
                                <TouchableOpacity
                                    style={{
                                        marginLeft: 10,
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: theme.colors.accent2,
                                    }}
                                    onPress={confirmComment}
                                >
                                    <FeatherIcon name="send" size={20} color={theme.colors.opposite} />
                                </TouchableOpacity>}
                        </View>
                    </KeyboardAvoidingView>
                }
            </BottomSheetView>
        </BottomSheet>
    );
});

export default CommentSheet;

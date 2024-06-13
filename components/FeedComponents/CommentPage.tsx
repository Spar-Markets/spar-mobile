
//This page and feed use redux to maintain local changes to upvotes and comment etc locally since 
//feed if local until forced refresh

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, ScrollView, TextInput } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import { useRoute } from '@react-navigation/native';
import Post from './Post';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import Comment from './Comment';

//expected format of post
interface RouteParams {
    postId: string
    username: string,
    postedTime: string,
    type: string,
    title: string,
    body: string,
    numComments: number,
    numReposts: number,
    votes: number,
    hasImage: boolean,
    isUpvoted: boolean,
    isDownvoted: boolean
}


const CommentPage = () => {

    // Layout and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width)
    const route = useRoute();

    const params = route.params as RouteParams | undefined;
 

    const post = useSelector((state: RootState) =>
        state.posts.find((p) => p.postId === params?.postId)
    );

    const [commentInput, setCommentInput] = useState("")
    
    return (
    <View style={styles.commentsContainer}>
        <PageHeader text={"Comments"}></PageHeader>
        <View style={{height: 20}}></View>
        <ScrollView>
            <Post {...post}></Post>
            <View style={{flexDirection: 'row'}}>
                <TextInput
                    placeholder="Comment something..."
                    placeholderTextColor={theme.colors.tertiary}
                    onChangeText={setCommentInput}
                    value={commentInput}
                    style={[styles.commentInputContainer, {flex: 1}]}
                    selectionColor={theme.colors.accent}
                    maxLength={250}
                    multiline
                />
                {commentInput.length > 0 ?
                <TouchableOpacity style={styles.postButton}>
                    <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity> :
                <TouchableOpacity style={[styles.postButton, {backgroundColor: theme.colors.tertiary}]}>
                    <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
                }
            </View>
            <Comment username={"Rzonance"} postedTime={new Date()} body={"I dont know about all that bro"}></Comment>
            <Comment username={"Rzonance"} postedTime={new Date()} body={"I dont know about all that bro"}></Comment>
            <Comment username={"Rzonance"} postedTime={new Date()} body={"I dont know about all that bro"}></Comment>
        </ScrollView>
        <View style={{flex: 1}}></View>
    </View>
    )
}

export default CommentPage;
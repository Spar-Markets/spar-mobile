
//This page and feed use redux to maintain local changes to upvotes and comment etc locally since 
//feed if local until forced refresh

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import { useRoute } from '@react-navigation/native';
import Post from './Post';
import { useSelector } from 'react-redux';
import { RootState } from '../../FeedManagment/store';

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
    
    return (
    <View style={styles.commentsContainer}>
        <PageHeader text={"Comments"}></PageHeader>
        <View style={{height: 20}}></View>
        <ScrollView>
            <Post {...post}></Post>
        </ScrollView>
        <View style={{flex: 1}}></View>
    </View>
    )
}

export default CommentPage;
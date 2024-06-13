import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Keyboard, KeyboardEvent, TextInput, ScrollView, Animated } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { useDispatch } from 'react-redux';
import { addPost } from '../../GlobalDataManagment/postSlice';
import generateRandomString from '../../utility/generateRandomString';
import useUserDetails from '../../hooks/useUserDetails';

const CreatePost = (props: any) => {

    // Layout and Style Initialization
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createFeedStyles(theme, width)

    const { user, userData, loading, error } = useUserDetails();

    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    const [postTitleInput, setPostTitleInput] = useState("");
    const [postTextInput, setPostTextInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const animatedMargin = useRef(new Animated.Value(70)).current;

    const categoryButton = (category: string, color: string) => {
        const handlePress = () => {
            setSelectedCategory(category);
        }

        const isSelectedStyle = {
            backgroundColor: color,
            borderRadius: 50,
            marginLeft: 10,
            borderWidth: 1,
            borderColor: color
        }

        const isNotSelectedStyle = {
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: color,
            borderRadius: 50,
            marginLeft: 10
        }

        return (
            <TouchableOpacity onPress={handlePress} style={category === selectedCategory ? isSelectedStyle : isNotSelectedStyle}>
                <Text style={{ color: theme.colors.text, fontWeight: 'bold', paddingVertical: 5, paddingHorizontal: 10 }}>{category}</Text>
            </TouchableOpacity>
        )
    }


    //keyboard animation
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', (event: KeyboardEvent) => {
            Animated.timing(animatedMargin, {
                toValue: event.endCoordinates.height + 20, // Add extra space here
                duration: 400,
                useNativeDriver: false
            }).start();
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', () => {
            Animated.timing(animatedMargin, {
                toValue: 70, // Keep some space at the bottom when keyboard is hidden
                duration: 400,
                useNativeDriver: false
            }).start();
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);


    const confirmPost = async () => {
        try {
            //find cryptographically strong method, crypto cant be used in RN
            const postId = generateRandomString(40);
            const localPostData = {
                postId: postId,
                username: userData!.username, //fix to be current logged in user through AUTH
                postedTime: Date.now(),
                type: selectedCategory,
                title: postTitleInput,
                body: postTextInput,
                numComments: 0,
                numReposts: 0,
                votes: 0,
                hasImage: false,
                isUpvoted: false,
                isDownvoted: false
            };

            const mongoPostData = {
                postId: postId,
                username: userData!.username,
                postedTime: Date.now(),
                type: selectedCategory,
                title: postTitleInput,
                message: postTextInput,
            }

            const response = await axios.post(serverUrl+"/postToDatabase", mongoPostData);
            console.log(response.data)
            dispatch(addPost(localPostData))
            navigation.goBack()
        } catch (error) {
            console.log(error)
        } 
    }



    return (
        <View style={styles.createPostContainer}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtnLeft}>
                    <Icon name="chevron-left" style={{ marginRight: 20, color: theme.colors.opposite }} size={24} />
                </TouchableOpacity>
                <Text style={styles.createPostHeaderText}>Create Post</Text>
                
                {/*make this a button only if all requirments met*/}
                {(selectedCategory != "" && postTextInput != "" && postTitleInput) != "" &&
                <TouchableOpacity onPress={confirmPost} style={[styles.headerBtnRight, {backgroundColor: theme.colors.accent}]}>
                    <Text style={styles.headerBtnRightText}>Post</Text>
                </TouchableOpacity>
                }

                {(selectedCategory == "" || postTextInput == "" || postTitleInput == "") &&
                <View style={[styles.headerBtnRight, {backgroundColor: theme.colors.tertiary}]}>
                    <Text style={styles.headerBtnRightText}>Post</Text>
                </View>
                }


            </View>
            <View style={{ flex: 1 }}>
                <ScrollView style={{ backgroundColor: theme.colors.primary, marginBottom: 20 }}>
                    <TextInput
                        placeholder="Title"
                        placeholderTextColor={theme.colors.tertiary}
                        onChangeText={setPostTitleInput}
                        value={postTitleInput}
                        style={styles.createPostTitleInputContainer}
                        selectionColor={theme.colors.accent}
                        maxLength={100}
                        multiline
                    />
                    <TextInput
                        placeholder="body text"
                        placeholderTextColor={theme.colors.tertiary}
                        onChangeText={setPostTextInput}
                        value={postTextInput}
                        style={styles.createPostTextInputContainer}
                        selectionColor={theme.colors.accent}
                        maxLength={100}
                        multiline
                        
                    />
                </ScrollView>
                <Animated.View style={[styles.categorySelect, { marginBottom: animatedMargin }]}>
                    <Text style={styles.categorySelectText}>Select Category</Text>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                        {categoryButton("Discussion", theme.colors.discussion)}
                        {categoryButton("Meme", theme.colors.meme)}
                        {categoryButton("News", theme.colors.news)}
                        {categoryButton("Dub", theme.colors.dub)}
                        {categoryButton("Question", theme.colors.question)}
                    </ScrollView>
                </Animated.View>
            </View>
        </View>
    )
}

export default CreatePost;

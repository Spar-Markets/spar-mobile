import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Keyboard, KeyboardEvent, TextInput, ScrollView, Animated, StyleSheet, Platform } from 'react-native';
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
import CommentType from "../../types/CommentType"
import ImagePicker from 'react-native-image-crop-picker'
import { Image } from 'react-native';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import ImageResizer from '@bam.tech/react-native-image-resizer'

const CreatePost = (props: any) => {

    // Layout and Style Initialization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width)

    const { user, userData, loading, error } = useUserDetails();

    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    const [postTitleInput, setPostTitleInput] = useState("");
    const [postTextInput, setPostTextInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const animatedMargin = useRef(new Animated.Value(70)).current;

    const [image, setImage] = useState<string | null>(null)

    const choosePhotoFromLibrary = () => {
        ImagePicker.openPicker({
            compressImageQuality: 0.3, // Adjust image quality
            cropperStatusBarColor: theme.colors.accent, // Status bar color of the cropper
            cropperToolbarColor: theme.colors.accent, // Toolbar color of the cropper
            cropperToolbarWidgetColor: theme.colors.text, // Toolbar widget color of the cropper
        }).then((image: any) => {
            const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
            setImage(imageUri);
        }).catch((error: any) => {
            console.log("Image picker error:", error);
        });
    };

    const categoryButton = (category: string, color: string) => {
        const handlePress = () => {
            setSelectedCategory(category);
        }

        const btnStyles = StyleSheet.create({
            selectedText: {
                color: theme.colors.text,
                fontWeight: 'bold',
                paddingVertical: 5, 
                paddingHorizontal: 10 
            },
            notSelectedText: {
                color: color,
                fontWeight: 'bold', 
                paddingVertical: 5, 
                paddingHorizontal: 10 
            },
            selectedBtn: {
                backgroundColor: color,
                borderRadius: 50,
                marginLeft: 10,
                borderWidth: 1,
                borderColor: color
            },
            notSelectedBtn: {
                backgroundColor: theme.colors.primary,
                borderWidth: 1,
                borderColor: color,
                borderRadius: 50,
                marginLeft: 10
            }
        })

        return (
            <TouchableOpacity onPress={handlePress} style={category === selectedCategory ? btnStyles.selectedBtn : btnStyles.notSelectedBtn}>
                <Text style={category === selectedCategory ? btnStyles.selectedText : btnStyles.notSelectedText}>{category}</Text>
            </TouchableOpacity>
        )
    }


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
                speed:14,
                bounciness: 1,
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
                hasTempImage: image ? true : false,
                hasImage: false,
                isUpvoted: false,
                isDownvoted: false,
                postedTimeAgo: "",
                comments: [],
                image: image ? image : null
            };
            console.log(localPostData)

            const mongoPostData = {
                postId: postId,
                posterId: userData!.userID,
                username: userData!.username,
                postedTime: Date.now(),
                type: selectedCategory,
                title: postTitleInput,
                message: postTextInput,
                hasImage: image ? true : false
            }

            console.log(mongoPostData)

            const response = await axios.post(serverUrl+"/postToDatabase", mongoPostData);
            console.log(response.data)
            dispatch(addPost(localPostData))
            
            try {
                if (image) {
                    const uri = image; // The URI of the image to be resized
                    const format = 'JPEG'; // The format of the resized image ('JPEG', 'PNG', 'WEBP')
                    const quality = 100; // The quality of the resized image (0-100)
                    
                    ImageResizer.createResizedImage(
                       uri, 500, 500, format, quality,
                    ).then(async (response) => {
                        const imageRes = await fetch(response.uri);
                        const blob = await imageRes.blob();
                        const imgRef = ref(storage, `postImages/${postId}`);
                        await uploadBytes(imgRef, blob);
                        navigation.goBack()
                        console.log('Image uploaded successfully');
                    })
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
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
                <ScrollView style={{ backgroundColor: theme.colors.primary, marginBottom: 20 }} keyboardDismissMode='on-drag'>
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
                        multiline
                        
                    />
                    {image != null ? 
                        <View style={{marginHorizontal: 20, marginVertical: 20}}>
                            <Image 
                                source={{uri: image}} 
                                style={{
                                    width: width-40, 
                                    height: undefined,
                                    aspectRatio: 1,
                                    borderRadius: 10,
                                }} 
                                resizeMode="cover"
                            />
                        </View>
                    : null}
                </ScrollView>

                <Animated.View style={[styles.categorySelect, { marginBottom: animatedMargin }]}>
                <TouchableOpacity style={{marginLeft: 20}} onPress={choosePhotoFromLibrary}>
                    <Icon name="photo" color={theme.colors.text} size={28}/>
                </TouchableOpacity>
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

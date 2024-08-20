import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Keyboard, KeyboardEvent, TextInput, ScrollView, Animated, StyleSheet, Platform, Linking, PermissionsAndroid, Alert } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../../GlobalDataManagment/postSlice';
import generateRandomString from '../../utility/generateRandomString';
import CommentType from "../../types/CommentType"
import ImagePicker from 'react-native-image-crop-picker'
import { Image } from 'react-native';
import { ref, uploadBytes } from 'firebase/storage';
import ImageResizer from '@bam.tech/react-native-image-resizer'
import { RootState } from '../../GlobalDataManagment/store';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import storage from '@react-native-firebase/storage';

const CreatePost = (props: any) => {

    // Layout and Style Initialization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width)

    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    const [postTitleInput, setPostTitleInput] = useState("");
    const [postTextInput, setPostTextInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const animatedMargin = useRef(new Animated.Value(70)).current;

    const [image, setImage] = useState<any>(null)

    const user = useSelector((state: RootState) => state.user)


    const requestPermissions = async () => {
        let photoLibraryPermissionGranted = false;

        if (Platform.OS === 'ios') {
            const photoLibraryPermission = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

            if (photoLibraryPermission == RESULTS.BLOCKED) {

                Alert.alert(
                    "Permission Required",
                    "Customizing your profile picture requires access to photos. Please enable them in the app settings.",
                    [
                        {
                            text: "Cancel",
                            style: "cancel"
                        },
                        {
                            text: "Open Settings",
                            onPress: () => {
                                if (Platform.OS === 'ios') {
                                    Linking.openURL('app-settings:');
                                } else {
                                    Linking.openSettings();
                                }
                            }
                        }
                    ]
                );
            } else if (photoLibraryPermission === RESULTS.GRANTED) {
                photoLibraryPermissionGranted = true;
            }

            // Uncomment this block if you need camera permissions
            /*const cameraPermission = await check(PERMISSIONS.IOS.CAMERA);
            if (cameraPermission !== RESULTS.GRANTED) {
              await request(PERMISSIONS.IOS.CAMERA);
            }*/
        } else if (Platform.OS === 'android') {
            const readPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            );

            const writePermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );

            const cameraPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
            );

            if (
                readPermission === PermissionsAndroid.RESULTS.GRANTED &&
                writePermission === PermissionsAndroid.RESULTS.GRANTED &&
                cameraPermission === PermissionsAndroid.RESULTS.GRANTED
            ) {
                photoLibraryPermissionGranted = true;
            }
        }

        return photoLibraryPermissionGranted;
    };

    const choosePhotoFromLibrary = () => {
        ImagePicker.openPicker({
            cropping: true,
            cropperStatusBarColor: theme.colors.accent, // Status bar color of the cropper
            cropperToolbarColor: theme.colors.accent, // Toolbar color of the cropper
            cropperToolbarWidgetColor: theme.colors.text, // Toolbar widget color of the cropper
            cropperToolbarTitle: 'Edit Photo',
            freeStyleCropEnabled: true,
            compressImageQuality: 1, // Set to 1 to avoid compression
            width: 1000,
            height: 1000
        }).then((image: any) => {
            console.log(image);
            setImage(image);
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

    const yourProfileImageUri = useSelector((state: any) => state.image.profileImageUri);

    const confirmPost = async () => {
        try {
            //find cryptographically strong method, crypto cant be used in RN
            const postId = generateRandomString(40);

            console.log("hello there", image)

            const localPostData = {
                postId: postId,
                posterId: user.userID!,
                username: user.username!,
                postedTime: Date.now(),
                type: selectedCategory,
                title: postTitleInput,
                body: postTextInput,
                numComments: 0,
                numReposts: 0,
                votes: 0,
                hasTempImage: image ? true : false,
                hasTempProfileImage: true,
                hasImage: false,
                isUpvoted: false,
                isDownvoted: false,
                postedTimeAgo: "",
                comments: [],
                image: image ? image.path : null,
                profileImage: yourProfileImageUri,
                aspectRatio: image ? image.width / image.height : null
            };
            //console.log(localPostData)

            const mongoPostData = {
                postId: postId,
                posterId: user.userID!,
                postedTime: Date.now(),
                type: selectedCategory,
                title: postTitleInput,
                message: postTextInput,
                hasImage: image ? true : false
            }

            console.log(localPostData)

            const response = await axios.post(serverUrl + "/postToDatabase", mongoPostData);
            console.log(response.data)

            if (response.status == 200) {
                try {
                    if (image) {
                        const uri = image.path; // The URI of the image to be resized
                        const format = 'JPEG'; // The format of the resized image ('JPEG', 'PNG', 'WEBP')
                        const quality = 100; // The quality of the resized image (0-100)

                        ImageResizer.createResizedImage(
                            uri, image.width, image.height, format, quality,
                        ).then(async (response) => {
                            const imgRef = storage().ref(`postImages/${postId}`);
                            console.log(response.uri)
                            await imgRef.putFile(response.uri)
                            dispatch(addPost(localPostData))
                            navigation.goBack()
                            console.log('Image uploaded successfully');
                        })
                    } else {
                        dispatch(addPost(localPostData))
                        navigation.goBack()
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                }
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
                    <TouchableOpacity onPress={confirmPost} style={[styles.headerBtnRight, { backgroundColor: theme.colors.accent }]}>
                        <Text style={styles.headerBtnRightText}>Post</Text>
                    </TouchableOpacity>
                }

                {(selectedCategory == "" || postTextInput == "" || postTitleInput == "") &&
                    <View style={[styles.headerBtnRight, { backgroundColor: theme.colors.tertiary }]}>
                        <Text style={styles.headerBtnRightText}>Post</Text>
                    </View>
                }


            </View>
            <View style={{ flex: 1 }}>
                <ScrollView style={{ backgroundColor: theme.colors.background, marginBottom: 20 }} keyboardDismissMode='on-drag'>
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
                        <TouchableOpacity onPress={choosePhotoFromLibrary} style={{ marginHorizontal: 20, marginVertical: 20 }}>
                            <Image
                                source={{ uri: image.path }}
                                style={{
                                    width: width - 40,
                                    height: undefined,
                                    aspectRatio: image.width / image.height,
                                    borderRadius: 10,
                                }}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                        : null}
                </ScrollView>

                <Animated.View style={[styles.categorySelect, { marginBottom: animatedMargin }]}>
                    <TouchableOpacity style={{ marginLeft: 20 }} onPress={choosePhotoFromLibrary}>
                        <Icon name="photo" color={theme.colors.text} size={28} />
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

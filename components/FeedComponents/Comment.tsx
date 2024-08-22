import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import timeAgo from '../../utility/timeAgo';
import Gap from '../HomeComponents/Gap';
import CommentGap from './CommentGap';
import getProfileImage from '../../utility/getProfileImage';
import { Skeleton } from '@rneui/base';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';

const Comment = React.memo((props: any) => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width)
    const [hasDefaultProfileImage, setHasDefaultProfileImage] = useState<any>(null);
    const [profileUri, setProfileUri] = useState<any>(null);

    const yourProfileImageUri = useSelector((state: any) => state.image.profileImageUri);
    const userID = useSelector((state: RootState) => state.user.userID)

    /* useEffect(() => {
         const getCommentProfileImage = async () => {
 
             if (userID == props.userID) {
                 setProfileUri(yourProfileImageUri)
             } else {
                 getProfileImage(props.userID)
                     .then(profileImageResponse => {
                         if (profileImageResponse) {
                             setHasDefaultProfileImage(profileImageResponse.hasDefaultProfileImage);
                             setProfileUri(profileImageResponse.profileImage);
                         }
                     })
                     .catch(error => {
                         console.error("error setting profile image", error);
                     });
             }
 
         };
 
         getCommentProfileImage();
     }, [])*/

    const [imageLoading, setImageLoading] = useState(true)

    return (
        <View style={styles.commentContainer}>
            {/*} <View style={{ flexDirection: 'row' }}>
                {imageLoading && (
                    <Skeleton
                        style={{ width: 25, height: 25, borderRadius: 100, backgroundColor: theme.colors.tertiary }}
                        skeletonStyle={{ backgroundColor: theme.colors.secondary }}
                    />
                )}
                {hasDefaultProfileImage && (
                    <Image
                        style={{
                            width: 25,
                            height: 25,
                            borderRadius: 100,
                            position: imageLoading ? 'absolute' : 'relative',
                            opacity: imageLoading ? 0 : 1,
                        }}
                        source={profileUri as any}
                        onLoadEnd={() => setImageLoading(false)}
                    />
                )}
                {!hasDefaultProfileImage && (
                    <Image
                        style={{
                            width: 25,
                            height: 25,
                            borderRadius: 100,
                            position: imageLoading ? 'absolute' : 'relative',
                            opacity: imageLoading ? 0 : 1,
                        }}
                        source={{ uri: profileUri } as any}
                        onLoadEnd={() => setImageLoading(false)}
                    />
                )}


            </View>*/}
            <View>
                <Text style={styles.usernameAndTime}>{props.username} • {timeAgo(new Date(props.postedTime))}</Text>
                <Text style={[styles.messageText, { marginHorizontal: 10 }]}>{props.body}</Text>
            </View>
        </View>
    )
})

export default Comment;
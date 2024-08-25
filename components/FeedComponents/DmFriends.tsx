import { View, Text, FlatList, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import { RootState } from '../../GlobalDataManagment/store';
import axios from "axios";
import { serverUrl } from '../../constants/global';
import getProfileImage from '../../utility/getProfileImage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Skeleton } from '@rneui/base';

const FriendItem = ({ friendID }: { friendID: string }) => {
    const { theme } = useTheme();
    const [username, setUsername] = useState<string | null>(null);
    const [hasDefaultProfileImage, setHasDefaultProfileImage] = useState<any>(null);
    const [profileUri, setProfileUri] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await axios.post(serverUrl + '/getUsernameByID', { userID: friendID });
                setUsername(response.data.username);
            } catch (error) {
                console.error(error);
            }
        };

        const getOtherProfileImage = async () => {
            getProfileImage(friendID)
                .then(profileImageResponse => {
                    if (profileImageResponse) {
                        setHasDefaultProfileImage(profileImageResponse.hasDefaultProfileImage);
                        setProfileUri(profileImageResponse.profileImage);
                    }
                })
                .catch(error => {
                    console.error("error setting profile image", error);
                });
        };

        fetchUsername().then(() => {
            getOtherProfileImage().then(() => {
                setLoading(false)
            });
        });

    }, [friendID]);

    const [imageLoading, setImageLoading] = useState(true)

    return (
        <TouchableOpacity style={{ alignItems: 'center', gap: 3 }}>
            {imageLoading && (
                <Skeleton
                    style={{ width: 80, height: 80, borderRadius: 100, backgroundColor: theme.colors.tertiary }}
                    skeletonStyle={{ backgroundColor: theme.colors.secondary }}
                />
            )}
            {hasDefaultProfileImage && (
                <Image
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: theme.colors.tertiary,
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
                        width: 80,
                        height: 80,
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: theme.colors.tertiary,
                        position: imageLoading ? 'absolute' : 'relative',
                        opacity: imageLoading ? 0 : 1,
                    }}
                    source={{ uri: profileUri } as any}
                    onLoadEnd={() => setImageLoading(false)}
                />
            )}
            {!imageLoading ? (
                <Text
                    style={{
                        color: theme.colors.text,
                        fontFamily: 'intertight-bold',
                        width: 80, // Set your max width here
                        textAlign: 'center', // Center the text
                    }}
                    numberOfLines={1} // Restrict to one line
                    ellipsizeMode="tail" // Add ellipsis if the text overflows
                >
                    {username || 'Loading...'}
                </Text>
            ) : (
                <Skeleton
                    animation={"pulse"}
                    height={15}
                    width={80}
                    style={{ backgroundColor: theme.colors.tertiary, borderRadius: 50 }}
                    skeletonStyle={{ backgroundColor: theme.colors.secondary }}
                />
            )}
        </TouchableOpacity>
    );
};

const FindFriendsItem = () => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity style={{ alignItems: 'center', gap: 3 }}>
            <View style={{
                width: 80,
                height: 80,
                borderRadius: 100,
                backgroundColor: theme.colors.secondary,
                borderWidth: 2,
                borderColor: theme.colors.tertiary,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{ color: theme.colors.text, fontSize: 24 }}>+</Text>
            </View>
            <Text style={{ color: theme.colors.text, fontFamily: 'intertight-bold' }}>
                Find Friends
            </Text>
        </TouchableOpacity>
    );
};

const DmFriends = () => {
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createFeedStyles(theme, width);
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        console.log(user.friends);
    }, [user.friends]);

    const data = [...user.friends, 'find_friends']; // Append a special identifier

    return (
        <View style={{ backgroundColor: theme.colors.background, width: width }}>
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
                renderItem={({ item }) => {
                    if (item === 'find_friends') {
                        return <FindFriendsItem />;
                    }
                    return <FriendItem friendID={item} />;
                }}
                contentContainerStyle={{ padding: 10, gap: 20 }}
                horizontal
            />
        </View>
    );
};

export default DmFriends;

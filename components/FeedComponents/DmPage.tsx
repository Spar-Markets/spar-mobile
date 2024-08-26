import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { serverUrl } from '../../constants/global';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import getProfileImage from '../../utility/getProfileImage';
import { Skeleton } from '@rneui/base';
import timeAgo from '../../utility/timeAgo';

const DmItem = ({ chat, navigateToChat, userID }: { chat: any, navigateToChat: any, userID: string }) => {
    const { theme } = useTheme();
    const [username, setUsername] = useState<string | null>(null);
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
    const [hasDefaultProfileImage, setHasDefaultProfileImage] = useState<boolean | null>(null);

    // Filter the participant IDs to exclude the user's own ID
    const otherParticipantID = chat.participantIDs.find((id: string) => id !== userID);

    const getDmProfileImage = async () => {
        try {
            const profileImageResponse = await getProfileImage(otherParticipantID);
            if (profileImageResponse) {
                setHasDefaultProfileImage(profileImageResponse.hasDefaultProfileImage);
                setProfileImageUri(profileImageResponse.profileImage);
            }
        } catch (error) {
            console.error("Error setting profile image:", error);
        }
    };

    const fetchUsername = async () => {
        try {
            const response = await axios.post(serverUrl + '/getUsernameByID', { userID: otherParticipantID });
            setUsername(response.data.username);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsername();
        getDmProfileImage();
        console.log("whats up", chat.lastMessage?.text)
    }, []);



    const [profileLoaded, setProfileLoaded] = useState(false);

    return (
        <TouchableOpacity onPress={() => navigateToChat(chat.conversationID, profileImageUri, hasDefaultProfileImage, username)} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>

            {!profileLoaded && (
                <Skeleton
                    style={{ width: 45, height: 45, borderRadius: 100, backgroundColor: theme.colors.tertiary }}
                    skeletonStyle={{ backgroundColor: theme.colors.secondary }}
                />
            )}
            {profileImageUri && (
                <Image
                    style={[
                        { width: 45, height: 45, borderRadius: 100, position: profileLoaded ? 'relative' : 'absolute', opacity: profileLoaded ? 1 : 0 },
                    ]}
                    source={hasDefaultProfileImage ? profileImageUri : { uri: profileImageUri } as any}
                    onLoad={() => setProfileLoaded(true)}
                />
            )}
            <View style={{ padding: 10, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', color: theme.colors.opposite }}>
                        {username}
                    </Text>
                    <View style={{ flex: 1 }} />
                    <Text style={{ color: theme.colors.secondaryText, fontSize: 12 }}>
                        {new Date(chat.lastMessage?.time).toLocaleTimeString()}
                    </Text>
                </View>
                <Text style={{ color: theme.colors.opposite, marginTop: 5 }}>
                    {chat.lastMessage?.text || "No messages yet"}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const DmPage = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createFeedStyles(theme, width);
    const navigation = useNavigation<any>();
    const userID = useSelector((state: RootState) => state.user.userID)

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get(`${serverUrl}/userConversations/${userID}`);
                if (response.status === 200) {
                    const dmConversations = response.data.chats.filter((chat: any) => chat.type === 'dm');
                    setConversations(dmConversations);
                } else {
                    console.error('Failed to retrieve conversations:', response.data.error);
                }
            } catch (error) {
                console.error('Error retrieving conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [userID]);

    const navigateToChat = (conversationID: string, imageUri: string, hasDefaultImage: boolean, username: string) => {
        navigation.navigate("Chat", { conversationID, userID, type: "dm", imageUri, hasDefaultImage, username })
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PageHeader text="Direct Messages" />
            <FlatList
                data={conversations}
                keyExtractor={(item: any) => item.conversationID}
                renderItem={({ item }) => (
                    <DmItem chat={item} navigateToChat={navigateToChat} userID={userID!} />
                )}
                style={{ marginHorizontal: 15, marginTop: 20 }}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.colors.tertiary, marginVertical: 5, marginLeft: 60 }} />}
            />
        </View>
    );
};

export default DmPage;

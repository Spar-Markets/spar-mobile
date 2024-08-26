import { View, Text, FlatList, Image, Keyboard, TextInput, KeyboardAvoidingView } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import BottomSheet, { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import FeatherIcon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';


interface FriendItemProps {
    friendID: string;
    onPress: (profileUri: string | null, hasDefaultProfileImage: boolean | null, username: string | null) => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friendID, onPress }) => {
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

    const handlePress = () => {
        onPress(profileUri, hasDefaultProfileImage, username);
    };

    return (
        <TouchableOpacity style={{ alignItems: 'center', gap: 3 }} onPress={handlePress}>
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

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const [selectedProfileUri, setSelectedProfileUri] = useState<string | null>(null);
    const [hasDefaultProfileUri, setHasDefaultProfileUri] = useState<boolean | null>(null);
    const [selectedUsername, setSelectedUsername] = useState<string | null>(null)
    // Handle opening the bottom sheet
    const handlePresentModalPress = useCallback((profileUri: string | null, hasDefaultProfileImage: boolean | null, username: string | null) => {
        setSelectedProfileUri(profileUri);
        setHasDefaultProfileUri(hasDefaultProfileImage)
        setSelectedUsername(username)
        bottomSheetModalRef.current?.present();
    }, []);

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

    useEffect(() => {
        console.log(user.friends);
    }, [user.friends]);

    const data = [...user.friends, 'find_friends']; // Append a special identifier

    return (
        <>
            <View style={{ backgroundColor: theme.colors.background, width: width }}>
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
                    renderItem={({ item }) => {
                        if (item === 'find_friends') {
                            return <FindFriendsItem />;
                        }
                        return <FriendItem friendID={item} onPress={handlePresentModalPress} />; // Pass handlePresentModalPress to FriendItem
                    }}
                    contentContainerStyle={{ padding: 10, gap: 20 }}
                    horizontal
                />

                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    index={0}
                    snapPoints={[300]}
                    onAnimate={(fromIndex, toIndex) => {
                        if (toIndex < fromIndex) {
                            // If the bottom sheet is moving down, dismiss the keyboard
                            Keyboard.dismiss();
                        }
                    }}
                    backdropComponent={renderBackdrop}
                    style={{ borderRadius: 10, overflow: 'hidden' }}
                    backgroundStyle={{ backgroundColor: theme.colors.secondary }}
                    handleIndicatorStyle={{ backgroundColor: theme.colors.secondaryText }}
                >

                    <BottomSheetView style={{ padding: 15, gap: 5 }}>
                        <View style={{ alignItems: 'center', marginBottom: 20, gap: 3 }}>
                            {hasDefaultProfileUri && selectedProfileUri && (
                                <Image
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 100,
                                        borderWidth: 2,
                                        borderColor: theme.colors.tertiary,
                                        //position: imageLoading ? 'absolute' : 'relative',
                                        //opacity: imageLoading ? 0 : 1,
                                    }}
                                    source={selectedProfileUri as any}
                                //onLoadEnd={() => setImageLoading(false)}
                                />
                            )}
                            {!hasDefaultProfileUri && selectedProfileUri && (
                                <Image
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 100,
                                        borderWidth: 2,
                                        borderColor: theme.colors.tertiary,
                                        //position: imageLoading ? 'absolute' : 'relative',
                                        //opacity: imageLoading ? 0 : 1,
                                    }}
                                    source={{ uri: selectedProfileUri } as any}
                                //onLoadEnd={() => setImageLoading(false)}
                                />
                            )}
                            <Text style={{ color: theme.colors.text, fontFamily: 'Intertight-bold' }}>{selectedUsername}</Text>
                            <LinearGradient colors={['#CD7F32', "#9e5915"]} style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 50 }}>
                                <Text style={{ color: '#4f3113', fontFamily: 'InterTight-bold' }}>Bronze</Text>
                            </LinearGradient>
                        </View>
                        <TouchableOpacity style={{ backgroundColor: theme.colors.accent2, justifyContent: 'center', alignItems: 'center', height: 60, borderRadius: 50 }}>
                            <Text style={{ color: theme.colors.opposite, fontFamily: 'intertight-bold' }}>Challenge</Text>
                        </TouchableOpacity>

                    </BottomSheetView>

                </BottomSheetModal>
            </View>
        </>
    );
};


export default DmFriends;

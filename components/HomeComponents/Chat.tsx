import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import axios from 'axios';
import { serverUrl, websocketUrl } from '../../constants/global';
import { useRoute } from '@react-navigation/native';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import HTHPageHeader from '../GlobalComponents/HTHPageHeader';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import FeatherIcon from 'react-native-vector-icons/Feather';

const Chat = () => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [inputText, setInputText] = useState<string>(''); // State for custom input text
    const [loading, setLoading] = useState<boolean>(true); // Loading state
    const route = useRoute();
    const params = route.params as any;
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createHomeStyles(theme, width);

    const ws = useRef<WebSocket | null>(null);

    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const sendHeartbeat = () => {
        if (ws.current) {
            const heartbeat = { type: "heartbeat" };
            ws.current.send(JSON.stringify(heartbeat));
        }
    };

    useEffect(() => {
        heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // 30 seconds interval

        // Clear the interval when the component unmounts
        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${serverUrl}/messages/${params.matchID}`);
                if (response.status === 200) {
                    const formattedMessages = response.data.messages.map((msg: any) => ({
                        _id: msg._id,
                        text: msg.message,
                        createdAt: new Date(msg.time),
                        user: {
                            _id: msg.userID,
                        },
                    }));
                    setMessages(formattedMessages.reverse());  // GiftedChat expects messages in reverse order
                } else {
                    console.error('Failed to retrieve messages:', response.data.error);
                }
            } catch (error) {
                console.error('Error retrieving messages:', error);
            } finally {
                setLoading(false); // Set loading to false once the messages are fetched
            }
        };

        fetchMessages();

        // Set up WebSocket connection
        ws.current = new WebSocket(websocketUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            ws.current?.send(JSON.stringify({ type: 'chats', userID: params.userID }));
        };

        ws.current.onmessage = (event) => {
            if (event.data === 'Websocket connected successfully') {
                return;
            }

            try {
                const message = JSON.parse(event.data);

                if (message.type === 'newChat') {
                    const newMessage = {
                        _id: message.newChat._id,
                        text: message.newChat.message,
                        createdAt: new Date(message.newChat.time),
                        user: {
                            _id: message.newChat.userID,
                        },
                    };
                    setMessages((previousMessages) => GiftedChat.append(previousMessages, [newMessage]));
                }
            } catch (error) {
                console.error('WebSocket message handling error:', error);
                console.warn('Non-JSON message received:', event.data);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        // Cleanup WebSocket on component unmount
        return () => {
            if (ws.current) {
                ws.current.close();
                console.log('WebSocket closed on component unmount');
            }
        };
    }, [params.matchID, params.userID]);

    // Handle sending messages
    const onSend = useCallback(() => {
        if (inputText.trim()) {
            const newMessages: IMessage[] = [
                {
                    _id: Math.random().toString(),
                    text: inputText.trim(),
                    createdAt: new Date(),
                    user: {
                        _id: params.userID,
                    },
                },
            ];

            setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));

            axios.post(`${serverUrl}/addMessage`, {
                matchID: params.matchID,
                userID: params.userID,
                message: inputText.trim(),
                time: new Date(),
            }).then(response => {
                if (response.status !== 200) {
                    console.error('Failed to send message:', response.data.error);
                }
            }).catch(error => {
                console.error('Error sending message:', error);
            });

            setInputText(''); // Clear the input after sending
        }
    }, [inputText, params.matchID, params.userID]);

    // Custom input toolbar for sending messages
    const renderInputToolbar = () => {
        return (
            <View style={styles.inputToolbarContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.colors.secondaryText}
                    multiline
                    value={inputText}
                    onChangeText={setInputText}
                    textAlignVertical="center"  // Ensure vertical alignment
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={onSend}
                >
                    <FeatherIcon name="send" size={20} color={theme.colors.opposite} />
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container]}>
            <HTHPageHeader endAt={params?.endAt} yourColor={params?.yourColor} text={params?.otherUsername} hasDefaultImage={params?.otherHasDefaultProfileImage} imageUri={params?.otherProfileUri} />
            <View style={{ flex: 1, marginTop: 10, marginBottom: 30 /*keyboard ative change*/ }}>
                <GiftedChat
                    messages={messages}
                    user={{ _id: params.userID }}
                    renderAvatar={null}
                    renderInputToolbar={renderInputToolbar}  // Custom input toolbar
                    renderBubble={(props) => (
                        <Bubble
                            {...props}
                            wrapperStyle={{
                                left: {
                                    backgroundColor: theme.colors.tertiary,
                                    marginLeft: 10,  // Removed left margin
                                    marginRight: 0, // Removed right margin
                                },
                                right: {
                                    backgroundColor: theme.colors.accent2,
                                    marginLeft: 0, // Reduced margin to bring it closer to the edge
                                    marginRight: 10,
                                },
                            }}
                            textStyle={{
                                left: {
                                    padding: 2,
                                    color: theme.colors.opposite,
                                    fontSize: 14,  // Customize the font size for left bubbles
                                    fontFamily: 'InterTight-Bold', // Customize the font weight for left bubbles
                                },
                                right: {
                                    padding: 2,
                                    color: theme.colors.opposite,
                                    fontSize: 14,  // Customize the font size for right bubbles
                                    fontFamily: 'InterTight-Bold', // Customize the font weight for right bubbles
                                },
                            }}
                        />
                    )}
                />
            </View>
        </View>
    );
};

export default Chat;

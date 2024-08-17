import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, FlatList, Keyboard } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import HTHPageHeader from '../GlobalComponents/HTHPageHeader';
import { TouchableOpacity } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import ChatMessage from './ChatMessage';
import axios from "axios"
import { serverUrl, websocketUrl } from '../../constants/global';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';


// Structure
// CHATS Collection:

// Document: 

// matchID: dasdasfq2r24df
// chats: [{userID: "", message: "", time: }, {}]


const Chat = () => {
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width);

    const [messages, setMessages] = useState<any>([]);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();

    const route = useRoute();
    const [retries, setRetries] = useState(0);
    const MAX_RETRIES = 5; // Maximum number of retry attempts
    const RETRY_DELAY = 2000; // Delay between retries in milliseconds
    const params = route.params as any

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (params?.userID) {
            if (!ws.current) {
                setupSocket()
                console.log("SETTING UP THE HOME WEBSOCKET ---------------------------------------------")
            }
        }
    }, [params?.userID])

    const sendMessage = async () => {
        try {
            const response = await axios.post(serverUrl + "/addMessage", { matchID: params?.matchID, userID: params?.userID, message })

            if (response.status == 200) {
                //console.log("Message sent succesfully", response.data.chat)
                //TODO add to client side immediately with redux

            } else {
                console.error("failed to send message", response.data.error)
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    const getMessagesForMatch = async (matchID: string) => {
        try {
            const response = await axios.get(`${serverUrl}/messages/${matchID}`);

            if (response.status === 200) {
                const messages = response.data.messages;
                console.log('Messages retrieved:', messages);
                return messages; // Return messages to use in your application
            } else {
                console.error('Failed to retrieve messages:', response.data.error);
                return [];
            }
        } catch (error) {
            console.error('Error retrieving messages:', error);
            return [];
        }
    };

    useEffect(() => {
        if (params?.matchID) {
            const fetchMessages = async () => {
                const matchID = params?.matchID; // Replace with the actual match ID
                const messages = await getMessagesForMatch(matchID);
                setMessages(messages);
            };

            fetchMessages();
        }
    }, [params?.matchID]);



    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const sendHeartbeat = () => {
        if (ws.current) {
            //console.log("SENDING WS HEARTBEAT FROM GAMECARD")
            //console.log("FROM GAME CARD", ws.current)
            const heartbeat = { type: "heartbeat" }
            ws.current.send(JSON.stringify(heartbeat))
        }
    }

    useEffect(() => {
        heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // 30 seconds interval

        // Clear the interval when the component unmounts
        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
        };
    }, [])


    //searchingForMatch || isInMatchmaking -----> these conditions == true, open websocket to look for match being created
    const setupSocket = async () => {
        return new Promise((resolve, reject) => {
            console.log('Opening chat socket with url:', websocketUrl);
            const socket = new WebSocket(websocketUrl);

            ws.current = socket;

            ws.current.onopen = () => {
                console.log(
                    `Connected to Chat Websocket, but not ready for messages...`,
                );
                if (ws.current!) {
                    console.log(
                        `Connection for Chat Websocket is open and ready for messages`,
                    );
                    // first send match ID
                    ws.current!.send(
                        JSON.stringify({ type: 'chats', userID: params?.userID }),
                    );
                } else {
                    console.log('WebSocket is not open');
                }
                resolve(ws.current);
            };

            // WebSocket message handling
            ws.current.onmessage = event => {
                if (event.data == 'Websocket connected successfully') {
                    return;
                }

                const message = event.data;
                const parsedMessage = JSON.parse(event.data);

                if (parsedMessage.type === 'newChat') {
                    // Append the new chat to the messages array
                    setMessages((prevMessages: any) => [...prevMessages, parsedMessage.newChat]);
                }

                console.log('chat websocket message received:', message);
            };

            ws.current.onerror = error => {
                console.log('WebSocket error:', error || JSON.stringify(error));
                if (retries < MAX_RETRIES) {
                    console.log(`Retrying connection (${retries + 1}/${MAX_RETRIES})...`);
                    setRetries(retries + 1);
                    setTimeout(() => {
                        setupSocket();
                    }, RETRY_DELAY);
                } else {
                    console.error(
                        'Maximum retry attempts reached. Unable to connect to WebSocket.',
                    );
                    reject(new Error('Websocket error. Maximum retry attempts reached.'));
                }
            };

            ws.current.onclose = () => {
                console.log(`Connection to GameCard Asset Websocket closed`);
                reject(new Error('Websocket closed before being opened.'));
            };
        });
    };



    return (
        <KeyboardAvoidingView
            style={[styles.container, { marginBottom: 40 }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <HTHPageHeader text="Chat" endAt={params?.endAt} yourColor={params?.yourColor} />
            <FlatList
                style={{ flex: 1, paddingTop: 20, marginTop: 5 }}
                data={messages}
                renderItem={({ item }) => (
                    <ChatMessage
                        message={item.message}
                        time={item.time}
                        userID={item.userID}
                    />
                )}
                keyExtractor={(item, index) => index.toString()}
                /*onScrollBeginDrag={() => {
                    Keyboard.dismiss(); // Dismiss the keyboard when scrolling starts
                }}*/
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }} // Add padding to ensure space above the TextInput
            />
            <View style={{ gap: 5, marginHorizontal: 10, marginBottom: 10, flexDirection: 'row' }}>
                <TextInput
                    style={{
                        flex: 1,
                        paddingHorizontal: 20,
                        paddingBottom: 10,
                        paddingTop: 10,
                        color: theme.colors.opposite,
                        backgroundColor: theme.colors.background,
                        borderWidth: 2,
                        borderColor: theme.colors.secondary,
                        borderRadius: 500,
                    }}
                    placeholder="Type a message..."
                    multiline
                    value={message}  // Bind the TextInput to the message state
                    onChangeText={setMessage}  // Update the message state as the user types
                />

                {message != "" ?
                    <TouchableOpacity
                        style={{
                            height: 40,
                            aspectRatio: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 500,
                            backgroundColor: theme.colors.accent2
                        }}
                        onPress={sendMessage}
                    >
                        <FeatherIcon name="send" size={18} color={theme.colors.opposite} />
                    </TouchableOpacity> :
                    <View
                        style={{
                            height: 40,
                            aspectRatio: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 500,
                            backgroundColor: theme.colors.secondary
                        }}
                    >
                        <FeatherIcon name="send" size={18} color={theme.colors.tertiary} />
                    </View>}
            </View>
        </KeyboardAvoidingView>
    );
};

export default Chat;

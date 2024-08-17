import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';

const ChatMessage = ({ message, time, userID }: { message: string, time: Date, userID: string }) => {
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createHomeStyles(theme, width);

    const reduxUserID = useSelector((state: RootState) => state.user.userID);

    useEffect(() => {
        console.log(time);
    }, [time]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const isOwnMessage = reduxUserID === userID;

    return (
        <View>
            <View
                style={{
                    maxWidth: '80%', // Limit the max width to 80% of the screen
                    alignSelf: isOwnMessage ? 'flex-end' : 'flex-start', // Align to right if fromYou, otherwise to left
                    backgroundColor: isOwnMessage ? theme.colors.accent2 : theme.colors.tertiary,
                    marginHorizontal: 20,
                    marginVertical: 2, // Add some vertical spacing between messages
                    padding: 10,
                    borderRadius: 10,
                    borderTopLeftRadius: isOwnMessage ? 10 : 0,
                    borderTopRightRadius: isOwnMessage ? 0 : 10, // Adjust the border radius based on the message side
                }}
            >
                <Text style={{ color: theme.colors.text }}>{message}</Text>
            </View>
            <Text
                style={{
                    color: theme.colors.secondaryText,
                    alignSelf: isOwnMessage ? 'flex-end' : 'flex-start', // Align the time text to left or right
                    paddingHorizontal: isOwnMessage ? 20 : 20, // Add horizontal padding from the window
                    fontFamily: 'InterTight-Bold',
                    fontSize: 11,
                    marginBottom: 5, // Add a bit of space below the time
                }}
            >
                {formatTime(new Date(time))}
            </Text>
        </View>
    );
};

export default ChatMessage;

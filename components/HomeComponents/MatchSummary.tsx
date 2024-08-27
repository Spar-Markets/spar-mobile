import { Animated, FlatList, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../ContextComponents/ThemeContext';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { ScrollView } from 'react-native-gesture-handler';




const MatchSummary = ({ matchID }) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width);
    const [match, setMatch] = useState<any>();
    const userID = useSelector((state: RootState) => state.user.userID);
    const [usernames, setUsernames] = useState<any[] | null>(null)
    const [yourColor, setYourColor] = useState<string | null>(null)
    const [oppColor, setOppColor] = useState<string | null>(null)
    const [youObject, setYouObject] = useState<any>(null)
    const [oppObject, setOppObject] = useState<any>(null)
    const [oppUsername, setOppUsername] = useState<string | null>(null)
    const [yourFinalValue, setYourFinalValue] = useState<any>(null)
    const [oppFinalValue, setOppFinalValue] = useState<any>(null)
    const [loading, setLoading] = useState<any>(true)
    const [yourTrades, setYourTrades] = useState<any>(null)
    const [oppTrades, setOppTrades] = useState<any>(null)


    async function getMatch() {
        try {
            const response = await axios.post(serverUrl + "/getPastMatch", { matchID: matchID, userID: userID });
            console.log("whats up everyone", response.data)
            console.log("whats up everyone", response.data.match)
            if (userID == response.data.match.user1.userID) {
                const oppResponse = await axios.post(serverUrl + "/getUsernameByID", { userID: response.data.match.user2.userID });
                //console.log(responseTwo.data, responseThree.data)
                //setUsernames([responseTwo.data, responseThree.data])\
                setOppUsername(oppResponse.data.username)
                setYouObject(response.data.match.user1)
                setOppObject(response.data.match.user2)
                setYourFinalValue(response.data.match.user1FinalValue)
                setOppFinalValue(response.data.match.user2FinalValue)
                setYourTrades(response.data.match.user1.trades)
                setOppTrades(response.data.match.user2.trades)

                if (response.data.match.user1FinalValue > response.data.match.user2FinalValue) {
                    setYourColor(theme.colors.stockUpAccent)
                    setOppColor(theme.colors.stockDownAccent)
                } else if (response.data.match.user1FinalValue < response.data.match.user2FinalValue) {
                    setYourColor(theme.colors.stockDownAccent)
                    setOppColor(theme.colors.stockUpAccent)
                } else {
                    setYourColor(theme.colors.secondaryText)
                    setOppColor(theme.colors.secondaryText)
                }
            } else {
                const oppResponse = await axios.post(serverUrl + "/getUsernameByID", { userID: response.data.match.user1.userID });
                //setUsernames([responseTwo.data, responseFour.data])
                setOppUsername(oppResponse.data.username)
                setYouObject(response.data.match.user2)
                setOppObject(response.data.match.user1)
                setYourFinalValue(response.data.match.user2FinalValue)
                setOppFinalValue(response.data.match.user1FinalValue)
                setYourTrades(response.data.match.user2.trades)
                setOppTrades(response.data.match.user1.trades)

                if (response.data.match.user1FinalValue < response.data.match.user2FinalValue) {
                    setYourColor(theme.colors.stockUpAccent)
                    setOppColor(theme.colors.stockDownAccent)
                } else if (response.data.match.user1FinalValue > response.data.match.user2FinalValue) {
                    setYourColor(theme.colors.stockDownAccent)
                    setOppColor(theme.colors.stockUpAccent)
                } else {
                    setYourColor(theme.colors.secondaryText)
                    setOppColor(theme.colors.secondaryText)
                }
            }
            console.log(response.data.match.user1.trades)
            setMatch(response.data.match);
        } catch (error) {
            console.error("Error in MatchSummary:", error);
        }
    }

    // get the match from mongo
    useEffect(() => {
        getMatch().then(() => {
            setLoading(false)
        })
    }, [])

    const hexToRGBA = (hex: any, alpha = 1) => {
        let r = 0, g = 0, b = 0;

        // Check if hex is in shorthand format (e.g., #fff)
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const indicatorWidth = (width - 40) / 2; // Each tab takes up 1/3 of the screen

    useEffect(() => {
        // Set the initial indicator position on mount
        scrollX.setValue(0);
    }, [width]);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleTabPress = (index: number) => {
        setSelectedIndex(index);
        scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    };

    const handleMomentumScrollEnd = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setSelectedIndex(index);
    };

    const textColorInterpolation = (index: number) => {
        return scrollX.interpolate({
            inputRange: [
                (index - 1) * width,
                index * width,
            ],
            outputRange: [
                theme.colors.secondaryText,
                theme.colors.text,
            ],
            extrapolate: 'clamp',
        });
    };


    return (
        <View
            style={{
                gap: 10,
                marginHorizontal: 20,
                alignItems: 'center',
                flex: 1,
            }}>
            <Text
                style={{
                    color: theme.colors.text,
                    fontFamily: 'Intertight-Bold',
                    fontSize: 16,
                }}>
                Match Summary
            </Text>

            {loading == false ?
                <View style={{ width: '100%' }}>
                    <View style={{ display: 'flex', alignItems: "center" }}>
                        <Text style={{
                            color: theme.colors.accent,
                            fontFamily: 'Intertight-Bold',
                            fontSize: 25,

                        }}>
                            You won ${String(2 * match!.wagerAmt)}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20, gap: 10, marginHorizontal: 0, borderRadius: 5 }}>
                        <View style={{ backgroundColor: 'transparent', flex: 1, borderRadius: 8, justifyContent: 'center', gap: 5, }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={styles.userText}>You</Text>
                            </View>

                            <>
                                <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-black', fontSize: 20 }}>
                                    ${yourFinalValue.toFixed(2)}
                                </Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={[styles.percentIndicator, { backgroundColor: hexToRGBA(yourColor, 0.3), paddingHorizontal: 2, borderColor: yourColor!, borderWidth: 0.5 }]}>
                                        <EntypoIcon name="triangle-up" color={yourColor!} size={18} />
                                        <Text style={[styles.percentText, { color: yourColor! }]}>{((yourFinalValue - 100000) / (0.01 * 100000)).toFixed(2)}%</Text>
                                    </View>
                                </View>
                            </>

                        </View>
                        <View style={{ backgroundColor: 'transparent', flex: 1, borderRadius: 8, justifyContent: 'center', gap: 5, }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                                <Text style={styles.userText}>{oppUsername}</Text>

                            </View>
                            <>
                                <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Black', fontSize: 20, textAlign: 'right' }}>
                                    ${oppFinalValue.toFixed(2)}
                                </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <View style={[styles.percentIndicator, { backgroundColor: hexToRGBA(oppColor, 0.3), paddingHorizontal: 2, borderColor: oppColor!, borderWidth: 0.5 }]}>
                                        <EntypoIcon name="triangle-down" color={oppColor!} size={18} />
                                        <Text style={[styles.percentText, { color: oppColor! }]}>{((oppFinalValue - 100000) / (0.01 * 100000)).toFixed(2)}%</Text>
                                    </View>
                                </View>
                            </>

                        </View>



                    </View>



                    {/* FlatList for Trades */}
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            {["You", oppUsername].map((label, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 10,
                                    }}
                                    onPress={() => handleTabPress(index)}
                                >
                                    <Animated.Text
                                        style={{
                                            color: textColorInterpolation(index),
                                            fontSize: 16,
                                            fontFamily: "intertight-bold"
                                        }}
                                    >
                                        {label}
                                    </Animated.Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {/* Animated indicator */}
                        <Animated.View
                            style={{
                                height: 2,
                                backgroundColor: theme.colors.text,
                                width: indicatorWidth,
                                position: 'absolute',
                                bottom: 0,
                                left: scrollX.interpolate({
                                    inputRange: [0, width - 40],
                                    outputRange: [0, indicatorWidth],
                                }),
                            }}
                        />
                    </View>

                    {/* Trades Header View */}
                    <View style={{ marginTop: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'Intertight-Bold', fontSize: 14, color: theme.colors.text, textAlign: 'left' }}>
                                    Ticker
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'Intertight-Bold', fontSize: 14, color: theme.colors.text, textAlign: 'left' }}>
                                    Shares
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'Intertight-Bold', fontSize: 14, color: theme.colors.text, textAlign: 'left' }}>
                                    Type
                                </Text>
                            </View>
                        </View>
                        {/* White Line Underneath the Labels */}
                        <View style={{ height: 1, backgroundColor: 'white', marginVertical: 5 }} />
                    </View>

                    <ScrollView
                        horizontal
                        pagingEnabled
                        scrollEventThrottle={16}
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        contentContainerStyle={{ width: (width - 40) * 2 }}
                        style={{ flexGrow: 1 }}>
                        <View style={{ width: width - 40 }}>
                            <FlatList
                                data={yourTrades.reverse()}  // Reverse the order
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <View style={{ flexDirection: 'row', paddingVertical: 5, justifyContent: 'space-between' }}>
                                        {/* Ticker */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'Intertight-semibold', fontSize: 14, color: theme.colors.text, textAlign: 'left' }}>
                                                {item.ticker}
                                            </Text>
                                        </View>
                                        {/* Shares */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'Intertight-semibold', fontSize: 14, color: theme.colors.text, textAlign: 'left' }}>
                                                {item.shares}
                                            </Text>
                                        </View>
                                        {/* Type */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'Intertight-semibold', fontSize: 14, color: theme.colors.text, textAlign: 'left' }}>
                                                {item.type}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            />
                        </View>
                        <View style={{ width: width - 40 }}>
                            <FlatList
                                data={oppTrades.reverse()}  // Reverse the order
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <View style={{ flexDirection: 'row', paddingVertical: 5, justifyContent: 'space-between' }}>
                                        {/* Ticker */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'Intertight-semibold', fontSize: 14, color: theme.colors.text, textAlign: 'left' }}>
                                                {item.ticker}
                                            </Text>
                                        </View>
                                        {/* Shares */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'Intertight-semibold', fontSize: 14, color: theme.colors.text, textAlign: 'left' }}>
                                                {item.shares}
                                            </Text>
                                        </View>
                                        {/* Type */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'Intertight-semibold', fontSize: 14, color: theme.colors.text, textAlign: 'left' }}>
                                                {item.type}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            />
                        </View>
                    </ScrollView>

                </View>
                : <View><Text style={{ color: theme.colors.text }}>Milk</Text></View>}
        </View>
    );
};

export default MatchSummary;

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createMatchStyles from '../../styles/createMatchStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import { RootState } from '../../GlobalDataManagment/store';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { center } from '@shopify/react-native-skia';

interface Match {
    _id: string;
    matchType: string;
    timeframe: number;
    wagerAmt: number;
    user1FinalValue: number;
    user2FinalValue: number;
    createdAt: string;
    user2: string;
    user1: string;
    opponentUsername: string;
}

const History = () => {
    // Layout and Style Initialization
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createMatchStyles(theme, width);
    const dispatch = useDispatch();

    const user = useSelector((state: RootState) => state.user);
    const [matches, setMatches] = useState<Match[] | null>(null); // Typed state for matches response
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        const getPastMatches = async () => {
            try {
                console.log("STEP 1")
                const response = await axios.post(serverUrl + "/getPastMatches", { userID: user.userID });
                console.log("STEP 2");
                const matchList = response.data.pastMatches;


                if (response.data.pastMatches) {
                    console.log("STEP 3: INSIDE MATCHES");
                    for (let i = 0; i < matchList.length; i++) {
                        // determine opponent's number (user1 or user2)
                        let oppUserNumber = ""
                        if (matchList[i].user1 == user.userID) {
                            oppUserNumber = "user2";
                        } else {
                            oppUserNumber = "user1";
                        }
                        // get opponent username
                        const res = await axios.post(serverUrl + "/getUsernameByID", { userID: matchList[i][oppUserNumber].userID })
                        matchList[i].opponentUsername = res.data.username
                        console.log("INSIDE FOR LOOP PASS", i)
                    }
                    console.log("FINISHED FOR LOOP");
                    setMatches(matchList)
                }
            } catch (error) {
                console.error('match history error', error);
            } finally {
                console.log("Gyatt o'clock log:", matches![0].opponentUsername);
                setLoading(false); // Stop loading
            }
        };
        getPastMatches();
    }, []);

    const renderMatchItem = ({ item }: { item: Match }) => {
        // Determine if the user won or lost
        let resultText = '';
        let wagerAmt = '';
        let resultDescription = '';
        let resultColor = '';
        const userWon = (item.user1 === user.userID && item.user1FinalValue > item.user2FinalValue) ||
            (item.user2 === user.userID && item.user2FinalValue > item.user1FinalValue);

        if (userWon) {
            resultText = 'You won a head-to-head match';
            resultDescription = `You won a head to head ${item.matchType} against ${item.opponentUsername} that lasted ${item.timeframe} seconds`
            wagerAmt = `+$${item.wagerAmt}`
            resultColor = theme.colors.stockUpAccent
        } else {
            resultText = 'You lost a head-to-head match';
            resultDescription = `You lost a head to head ${item.matchType} against ${item.opponentUsername} that lasted ${item.timeframe} seconds`
            wagerAmt = `-$${item.wagerAmt}`
            resultColor = theme.colors.stockDownAccent

        }

        return (
            <View style={{ margin: 10, display: 'flex', flexDirection: 'row', }}>
                <View style={{ flex: 3.75 / 5 }}>
                    <Text style={[styles.matchTypeText, { color: resultColor, fontWeight: '600' }]}>{resultText}</Text>
                    <Text style={[styles.matchTypeText, { fontSize: 14 }]}>{resultDescription}</Text>
                </View>
                <View style={{ flex: 1.25 / 5 }}>
                    <Text style={[styles.matchTypeText, { color: resultColor, textAlign: 'right' }]}>{wagerAmt}</Text>
                    <Text style={[styles.matchTypeText, { fontSize: 14, textAlign: 'right' }]}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
            </View>
        );
    };



    if (!loading) {
        return (
            <View style={styles.container}>
                <PageHeader text="Match History" />
                <View style={{ flex: 1, padding: 20 }}>
                    <FlatList
                        data={matches}  // Access the correct array
                        keyExtractor={(item) => item._id}
                        renderItem={renderMatchItem}
                        ItemSeparatorComponent={() => {
                            return (<View style={{ width: width - 40, height: 2, backgroundColor: theme.colors.primary, }} />)
                        }}
                    />
                </View>
            </View>
        );
    }
};

export default History;

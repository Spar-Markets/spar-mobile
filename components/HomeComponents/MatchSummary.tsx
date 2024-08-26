import { Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../ContextComponents/ThemeContext';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';

// Assuming AccountType is the type of each account object within the "accounts" array
interface Match {
    user1FinalValue: number;
    wagerAmt: number;
}

const MatchSummary = ({ matchID }) => {
    const { theme } = useTheme();
    const [match, setMatch] = useState<Match>();
    const userID = useSelector((state: RootState) => state.user.userID);
    const [usernames, setUsernames] = useState<any[] | null>(null)
    async function getMatch() {
        try {
            const response = await axios.post(serverUrl + "/getPastMatch", { matchID: matchID, userID: userID });
            
            const responseTwo = await axios.post(serverUrl + "/getUsernameByID", { userID: userID });
            console.log("hello", responseTwo)
            if (userID == response.data.match.match.user1.userID) {
                const responseThree = await axios.post(serverUrl + "/getUsernameByID", { userID: response.data.match.match.user2.userID });
                setUsernames([responseTwo.data, responseThree.data])

            } else {
                const responseFour = await axios.post(serverUrl + "/getUsernameByID", { userID: response.data.match.match.user1.userID });
                setUsernames([responseTwo.data, responseFour.data])
            }

            setMatch(response.data.match);
        } catch (error) {
            console.error("Error in MatchSummary:", error);
        }
    }

    // get the match from mongo
    useEffect(() => {
        getMatch()
    }, [])


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

            {match ?
                <View style={{width: '100%'}}>
                    <View style={{display: 'flex', alignItems: "center"}}>
                        <Text style={{
                            color: theme.colors.text,
                            fontFamily: 'Intertight-Bold',
                            fontSize: 30,
                        }}>
                        You won {String(2 * match.wagerAmt)}
                        </Text>
                    </View>
                    <View style={{display: 'flex', flexDirection: "row", marginTop: 20, gap: 30}}>
                        <View style={{flex: 1}}>    
                            <Text
                                style={{color: theme.colors.text, fontFamily: 'Intertight-Bold', fontSize: 16}}>

                                
                                {String(match.user1.userID)}

                            </Text>
                            <Text
                                style={{color: theme.colors.text, fontFamily: 'Intertight-Bold', fontSize: 16}}>

                                {String(match.user1FinalValue)}
                            </Text>
                            <Text
                                style={{color: theme.colors.text, fontFamily: 'Intertight-Bold', fontSize: 16}}>

                                {String((match.user1FinalValue/100000))}%
                            </Text>
                        </View>
                        <View style={{flex: 1, alignItems: "flex-end"}}>
                            <Text
                                style={{color: theme.colors.text, fontFamily: 'Intertight-Bold', fontSize: 16}}>

                                
                                {String(match.user1.userID)}
                            </Text>
                            <Text
                                style={{color: theme.colors.text, fontFamily: 'Intertight-Bold', fontSize: 16}}>
                                {String(match.user1FinalValue)}
                            </Text>
                            <Text
                                style={{color: theme.colors.text, fontFamily: 'Intertight-Bold', fontSize: 16}}>
                                {String((match.user1FinalValue/100000))}%
                            </Text>
                        </View>
                    </View>






                </View>
                : <View><Text>Milk</Text></View>}
        </View>
    );
};

export default MatchSummary;

import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHTHStyles from '../../styles/createHTHStyles';
import axios from 'axios'
import { serverUrl } from '../../constants/global';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PastMatchCard = (props:any) => {
    
    const navigation = useNavigation<any>();
    const route = useRoute();

    MaterialCommunityIcons.loadFont()
  
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createHTHStyles(theme, width);

    const matchData = props.matchData

    const [firstPlace, setFirstPlace] = useState("")
    const [secondPlace, setSecondPlace] = useState("")

    const getLeaderboard = async () => {
        console.log(matchData)
        try {
         if (matchData.user1.userID == props.userID) {
            const username2 = await axios.post(serverUrl + '/getUsernameByID', { userID: matchData.user2.userID});
            setFirstPlace("You")
            setSecondPlace(username2.data.username)
         } else {
            const username1 = await axios.post(serverUrl + '/getUsernameByID', { userID: matchData.user1.userID});
            setFirstPlace(username1.data.username)
            setSecondPlace("You")
         }
        } catch (error) {
            console.error("error getting usernames")
        }
    }

    useEffect(() => {
        getLeaderboard()
    }, [])

    const hexToRGBA = (hex:any, alpha = 1) => {
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


    return (
        <TouchableOpacity style={{
            //marginHorizontal: 20, 
            //backgroundColor: 
            //theme.colors.primary,
            borderRadius: 10}}
        > 
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15, marginHorizontal: 20, gap: 5}}>
                <View style={{backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.accent}}>
                    <Text style={{color: theme.colors.accent, fontFamily: 'InterTight-Black', fontSize: 13}}>Stock</Text>
                </View>
                <View style={{flex: 1}}></View>
                <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Black', fontSize: 12}}>Paid: $20.00</Text>
                <View style={{backgroundColor: theme.colors.accent, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.accent, borderRadius: 4, flexDirection: 'row'}}>
                    <Text style={{color: theme.colors.primary, fontFamily: 'InterTight-Black', fontSize: 13}}>W</Text>
                </View>
            </View>
            <View style={{flex: 1, marginHorizontal: 20, marginVertical: 10, gap: 10}}>
                <View style={{justifyContent: 'center'}}>
                    <View style={{gap: 5, flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Black', fontSize: 16}}>{firstPlace}</Text>
                        <MaterialCommunityIcons name="crown-circle" color={theme.colors.accent} size={24} style={{}}/>
                        <View style={{flex: 1}}></View>
                        <View style={{backgroundColor: hexToRGBA(theme.colors.accent, 0.2), alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5}}>
                            <Text style={{color: theme.colors.accent, fontFamily: 'InterTight-Bold', fontSize: 15}}>+4.54%</Text>
                        </View>
                    </View>
                </View>
                <View style={{justifyContent: 'center'}}>
                    <View style={{gap: 5, flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Black', fontSize: 16}}>{secondPlace}</Text>
                        <View style={{flex: 1}}></View>
                        <View style={{backgroundColor: hexToRGBA(theme.colors.text, 0.2), alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5}}>
                            <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 15}}>+2.86%</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15, marginHorizontal: 20}}>
                <View>
                    <Text style={{color: theme.colors.secondaryText, fontFamily: 'InterTight-Semibold', fontSize: 11}}>Wager: $10.00</Text>
                </View>
                <View style={{flex: 1}}></View>
                <Text style={{color: theme.colors.secondaryText, fontFamily: 'InterTight-Semibold', fontSize: 11}}>Completed: {new Date(matchData.endAt).toLocaleString()}</Text>
            </View>

        </TouchableOpacity>
    )
}

export default PastMatchCard
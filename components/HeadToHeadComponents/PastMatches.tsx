import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHTHStyles from '../../styles/createHTHStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import axios from 'axios'
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import { serverUrl } from '../../constants/global';
import { ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native';
import PastMatchCard from './PastMatchCard';



const PastMatches = () => {
    
    const navigation = useNavigation<any>();
    const route = useRoute();
    
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createHTHStyles(theme, width);

    const userID = useSelector((state: RootState) => state.user.userID);

    const [pastMatches, setPastMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    
    const getPastMatches = async () => {
        try {
            console.log("USER ID:", userID)
            const response = await axios.post(serverUrl + '/getPastMatches', { userID });
            // Handle the response as needed
            return response.data.pastMatches;
        } catch (error) {
            console.error("There was an error fetching the match history!", error);
            // Handle the error as needed
            throw error;
        }
    };

    useEffect(() => {
        const fetchMatchHistory = async () => {
          try {
            const data = await getPastMatches();
            setPastMatches(data.pastMatches);
          } catch (error) {
            setError("Error fetching match history");
          } finally {
            setLoading(false);
          }
        };
        fetchMatchHistory();
      }, [userID]);

    if (loading) {
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }

    if (error) {
        return <Text>{error}</Text>;
    }

    return (
        <View style={styles.container}>
            <PageHeader text="History"/>
            <FlatList
                data={pastMatches}
                renderItem={({item}) => <PastMatchCard matchData={item} userID={userID}/>}
                keyExtractor={(item) => item.matchID}
                ItemSeparatorComponent={() => <View style={{height:1, marginVertical: 5, backgroundColor: theme.colors.secondary, marginHorizontal: 20}}/>}
                style={{marginTop: 10}}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default PastMatches
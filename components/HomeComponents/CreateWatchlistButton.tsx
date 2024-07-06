import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import HapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios'
import { serverUrl } from '../../constants/global';
import useUserDetails from '../../hooks/useUserDetails';

const CreateWatchlistButton = (props:any) => {

    const {theme} = useTheme();
    const {width, height} = useDimensions();
    const styles = createHomeStyles(theme, width);

    const navigation = useNavigation<any>();
    const {userData} = useUserDetails();

    const createWatchList = async () => {
        if (userData && props.watchListName != "" && props.watchListIcon != "") {
            try {
                const response = await axios.post(serverUrl + "/createWatchList", 
                    {userID: userData?.userID, 
                    watchListName: props.watchListName, 
                    watchListIcon: props.watchListIcon})
                if (response) {
                    console.log("SUCCESS CREATING WATCHLIST")
                }
            } catch (error) {
                console.error("error creating watchlist", error)
            }
        } else {
            console.log("NO USER YET. LOWKEY HOW DID U CLICK CREATE WATCHLIST THAT FAST")
        }
    }

    return (
      <TouchableOpacity
        style={{
          marginTop: 15,
        }}
        onPress={() => {
          HapticFeedback.trigger('impactMedium', {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
          });
          if (props.onCreateListPage == true) {
            createWatchList()
            navigation.goBack()
          } else {
            navigation.navigate('CreateList');
          }
        }}>
        <View
          style={{
            marginHorizontal: 20,
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10
          }}>
          {/*<View style={{backgroundColor: theme.colors.accent, width: 51, height: 51, borderRadius: 10, position: 'absolute', right: 3, top: 6}}></View>*/}
          <View
            style={{
              backgroundColor: theme.colors.primary,
              width: 50,
              height: 60,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.colors.tertiary,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Icon
              name="plus-circle"
              size={24}
              color={theme.colors.accent}></Icon>
            </View>
          </View>
          <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>Create List</Text>
        </View>
      </TouchableOpacity>
    );
  };

export default CreateWatchlistButton
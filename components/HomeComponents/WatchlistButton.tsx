import { View, Text, TouchableOpacity, Touchable, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react'
import HapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios'
import { serverUrl } from '../../constants/global';
import useUserDetails from '../../hooks/useUserDetails';
import StockCard from '../StockComponents/StockCard';

const WatchlistButton = (props:any) => {

    const {theme} = useTheme();
    const {width, height} = useDimensions();
    const styles = createHomeStyles(theme, width);

    const navigation = useNavigation<any>();
    const {userData} = useUserDetails();

    const [selected, setSelected] = useState(false)

    useEffect(() => {
        setSelected(props.isSelected);
    }, [props.isSelected]);

    return (
      <View style={{
        marginTop: 15,
      }}>
      <TouchableWithoutFeedback
        onPress={() => {
          HapticFeedback.trigger('impactMedium', {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
          });

          if (props.onAddToWatchListPage === true) {
            props.onQueueChange(props.watchListName);
          } 
        }}>
        <View
          style={{
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
            <Text>{props.watchListIcon}</Text>
            </View>
          </View>
          <View>
            <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>{props.watchListName}</Text>
            <Text style={{color: theme.colors.tertiary, fontFamily: 'InterTight-SemiBold'}}>{props.numberOfAssets} Assets</Text>
          </View>
          <View style={{flex: 1}}></View>
          
          {props.onAddToWatchListPage == true ? (
          <View
            style={[
              selected
                ? { backgroundColor: theme.colors.accent }
                : { backgroundColor: 'transparent' },
              { borderWidth: 1, borderRadius: 50, width: 20, height: 20, borderColor: theme.colors.tertiary },
            ]}
          />
        ) : (
         <TouchableOpacity onPress={() => setSelected(!selected)} style={{borderRadius: 50, borderWidth: 1, borderColor: theme.colors.opposite, paddingHorizontal: 2}}>
            <Icon name={selected ? "chevron-circle-up": "chevron-circle-down"} size={24} color={theme.colors.opposite}></Icon>
        </TouchableOpacity>
        )}
        </View>
      </TouchableWithoutFeedback>
      {selected == true && props.assets && 
      <View style={{backgroundColor: theme.colors.primary, paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.tertiary, marginTop: 10}}>
        <View style={{marginVertical: 10}}>
        {props.assets.map((asset:string, index:any) => {
            return (
                <View key={index}>
                <StockCard ticker={asset}/>
                {index != props.assets.length-1 && <View style={{height: 1, width: '100%', backgroundColor: theme.colors.tertiary, marginVertical: 10}}/>}
                </View>
            )
        })}
        </View>
      </View>}
      </View>
    );
  };

export default WatchlistButton
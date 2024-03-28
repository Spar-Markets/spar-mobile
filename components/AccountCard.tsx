import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TouchableWithoutFeedback, Touchable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GraphPoint, LineGraph } from 'react-native-graph';
import { serverUrl } from '../constants/global';
import axios from 'axios'


const AccountCard = (props:any) => {

    const colorScheme = useColorScheme();
    const navigation = useNavigation<any>();

    const [pointData, setPointData] = useState<GraphPoint[]>([])

    const [touchableWidth, setTouchableWidth] = useState(0);

    const onLayout = (event:any) => {
      const { width } = event.nativeEvent.layout;
      setTouchableWidth(width);
    };

    useEffect(() => {
  
        const getPrices = async () => {
            try {
                const response = await axios.post(serverUrl + "/getOneDayStockData", {ticker:'TSLA'})
                
                if (response) {
                   
                    const points: GraphPoint[] = response.data.prices.map((obj:any) => ({
                        value: obj.price,
                        date: new Date(obj.timeField)
                    }));

                    setPointData(points)


                    

                }
            } catch {
                console.error("error getting prices")
            }
        }

        getPrices();

    }, []);
    

    return (
        <View style={{flexDirection: 'row', marginHorizontal: 15}}>
        <View onLayout={onLayout} style={[colorScheme == 'dark' ? {backgroundColor: '#242F42'} : {backgroundColor: '#fff'}, styles.container]}>
          <View style={{justifyContent: 'center', marginTop: 15}}>
            <Text style={{color: '#888888', fontFamily: 'InterTight-SemiBold', fontSize: 14, marginLeft: 15}}>Account Value</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 15}}>
                <Text style={[colorScheme == 'dark' ? {color:'#fff'}:{color:'#000'}, {fontFamily: 'InterTight-Black', fontSize: 24}]}>${props.text}</Text>
                <View style={{backgroundColor: '#1ae79c', borderRadius: 5, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, marginLeft: 10, height: 20}}>
                    <Text style={{color: '#242F42', fontFamily: 'InterTight-Bold', fontSize: 12}}>+5.55%</Text>
                </View>
            </View>
            <View style={{flex: 1}}></View>
            {/*<LineGraph
                style={{width: touchableWidth, height: 110, marginBottom: 12}}
                points={pointData}
                animated={true}
                color={'#1ae79c'}
                gradientFillColors={['#0e8a5c', '#242F42']}
                enablePanGesture
                //onPointSelected={(p) => updateVals(p)}
                lineThickness={5}
                horizontalPadding={0}
    />*/}
          </View>
        </View>
        <TouchableOpacity style={{flex: 0.15, backgroundColor: '#1ae79c', width: 30, marginTop: 8, borderRadius: 10, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontFamily: 'InterTight-Black', fontSize: 20, color: '#242F42'}}>+</Text>
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
  container: { 
    marginRight: 10, 
    marginTop: 8, 
    marginBottom: 0,
    height: 80,
    borderRadius: 12, 
    flexDirection: 'row',
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    flex: 1,
  },
})


export default AccountCard;
import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TouchableWithoutFeedback, Touchable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GraphPoint, LineGraph } from 'react-native-graph';
import { serverUrl } from '../constants/global';
import axios from 'axios'
import LinearGradient from 'react-native-linear-gradient';
import getPrices from "../utility/getPrices"


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
        const run = async () =>{
            const points = await getPrices(props.ticker, "1D");
            if (points != undefined) {
                setPointData(points);
            }
        }
    
        run();

    }, []);

    const [timeFrameSelected, setTimeFrameSelected] = useState("1D")

    const TimeButton = (timeFrame:string) => {
        return (
        <View>
        {timeFrameSelected == timeFrame ?
        <TouchableOpacity onPress={() => setTimeFrameSelected(timeFrame)} style={{backgroundColor: '#1ae79c', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginHorizontal: 5}}>
            <Text style={{color:'#000', paddingHorizontal: 10, paddingVertical: 5, fontFamily: 'InterTight-Black', fontSize: 15}}>{timeFrame}</Text>
        </TouchableOpacity> : 
        <TouchableOpacity onPress={() => setTimeFrameSelected(timeFrame)} style={[colorScheme=="dark" ? {backgroundColor: '#000'} : {backgroundColor:'#eee'}, {justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginHorizontal: 5}]}>
            <Text style={{color:'#1ae79c', paddingHorizontal: 10, paddingVertical: 5, fontFamily: 'InterTight-Black', fontSize: 15}}>{timeFrame}</Text>
        </TouchableOpacity>
        }
        </View>
        )
    }

    return (
        <View>
        <TouchableOpacity style={[colorScheme == "dark" ? {backgroundColor: '#bfeab9'}:{backgroundColor:'#fff'}, {borderRadius: 12, width: 100, height: 100, 
        marginHorizontal: 15, justifyContent: 'center', alignItems: 'center'}]}>
            <View style={{alignItems: 'center'}}>
                <Text style={{color: '#000', fontFamily: 'InterTight-SemiBold', fontSize: 14}}>Rating</Text>
                <Text style={[colorScheme == 'dark' ? {color:'#000'}:{color:'#000'}, {fontFamily: 'InterTight-Black', fontSize: 24}]}>{props.rating}</Text>
            </View>
            {/*<View style={{flex: 1}}>
            
            <LineGraph
                style={{height: 40, width: 100}}
                points={pointData}
                animated={true}
                color={'#1ae79c'}
                //gradientFillColors={colorScheme == "dark" ? ['#0e8a5c', '#222']:['#0e8a5c', '#fff']}
                //onPointSelected={(p) => updateVals(p)}
                lineThickness={1}
                horizontalPadding={0}
       
            </View>*/}
        </TouchableOpacity>
       {/*<ScrollView horizontal={true} style={{marginTop: 10, marginRight: 10, marginLeft: 10}} showsHorizontalScrollIndicator={false}>
            {TimeButton("1D")}
            {TimeButton("1W")}
            {TimeButton("1M")}
            {TimeButton("3M")}
            {TimeButton("YTD")}
            {TimeButton("1Y")}
            {TimeButton("5Y")}
            {TimeButton("MAX")}
        </ScrollView>*/}
        </View>
    );
};

const styles = StyleSheet.create({
  container: { 
    marginRight: 10, 
    marginTop: 8,
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

/*<LineGraph
                style={{width: touchableWidth, height: 110, marginBottom: 12}}
                points={pointData}
                animated={true}
                color={'#1ae79c'}
                gradientFillColors={['#0e8a5c', '#242F42']}
                enablePanGesture
                //onPointSelected={(p) => updateVals(p)}
                lineThickness={5}
                horizontalPadding={0}
    />*/
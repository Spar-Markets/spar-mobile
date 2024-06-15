import React, {useState, useEffect} from 'react';
import { Text, TouchableOpacity, View, useColorScheme} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {GraphPoint, LineGraph} from 'react-native-graph';
import {serverUrl} from '../../constants/global';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
//import {LineChart} from "react-native-chart-kit"
import Timer from './Timer';


const GameCard = (props: any) => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width)

  const sendData = {
    mode: props.mode,
    amountWagered: props.amountWagered,
    endDate: props.endDate.getTime(),
    yourPercentChange: props.yourPercentChange,
    opp: props.opp,
    oppPercentChange: props.oppPercentChange,
    idIndex: props.idIndex,
  };

  interface TickerPricestamp {
    price: number;
    timeField: number;
  }

  const [pointData, setPointData] = useState<GraphPoint[]>([]);
  const [pointData2, setPointData2] = useState<GraphPoint[]>([]);

  useEffect(() => {
    // !!!! RAGTAG: this is for the users graphs as a placeholder. It shows the aapl and tsla most recent trading day charts -GRANT
    const getPrices = async () => {
      try {
        const response = await axios.post(
          serverUrl + '/getMostRecentOneDayPrices',
          {ticker: ['AAPL'], timeframe: '1D'},
        );

        // Check if response is successful and has data
        if (response && response.data && response.data['AAPL']) {
          const tickerData: TickerPricestamp[] = response.data['AAPL'];

          // Map the data to the format expected by the graphing library
          const points = tickerData.map(tickerData => ({
            value: tickerData.price,
            date: new Date(tickerData.timeField),
          }));

          setPointData(points);
        }
      } catch (error) {
        console.error(error, 'game card error getting prices');
      }

      try {
        const response = await axios.post(
          serverUrl + '/getMostRecentOneDayPrices',
          {ticker: ['TSLA'], timeframe: '1D'},
        );

        // Check if response is successful and has data
        if (response && response.data && response.data['TSLA']) {
          const tickerData: TickerPricestamp[] = response.data['TSLA'];

          // Map the data to the format expected by the graphing library
          const points = tickerData.map(tickerData => ({
            value: tickerData.price,
            date: new Date(tickerData.timeField),
          }));

          setPointData2(points);
        }
      } catch (error) {
        console.error(error, 'game card 2 error getting prices');
      }
    };

    getPrices();
  }, []);

  const [cardWidth, setCardWidth] = useState(0);

  const onLayout = (event:any) => {
    const { width } = event.nativeEvent.layout;
    setCardWidth(width);
  };

  return (
    <TouchableOpacity onLayout={onLayout} style={styles.gameCardContainer}>
        <View style={{flexDirection: 'row'}}>
          <View style={styles.gameCardAmountWageredContainer}>
            <Text style={styles.gameCardAmountWageredText}>${props.amountWagered}</Text>
          </View>
          <View style={styles.gameCardModeContainer}>
            <Text style={styles.gameCardModeText}>{props.mode}</Text>
          </View>
          <View style={{flex: 1}}></View>
          <Timer endDate={props.endDate} timeFrame={props.timeFrame}/>
        </View>
        <View style={{gap: 10, marginHorizontal: 10, marginTop: 10, flex: 1}}>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <View style={[styles.gameCardIndicator, {backgroundColor: theme.colors.accent}]}></View>
            <View style={{justifyContent: 'center'}}>
              <Text style={styles.gameCardPlayerText}>You</Text>
            </View>
            <View style={styles.gameCardPercentageContainer}>
              <Text style={[styles.gameCardPercentageText, {color: theme.colors.accent}]}>{props.yourPercentChange}%</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 5}}>
            <View style={[styles.gameCardIndicator, , {backgroundColor: theme.colors.opposite}]}></View>
            <View style={{justifyContent: 'center'}}>
              <Text style={styles.gameCardPlayerText}>{props.opp}</Text>
            </View>
            <View style={styles.gameCardPercentageContainer}>
              <Text style={[styles.gameCardPercentageText, {color: theme.colors.opposite}]}>{props.oppPercentChange}%</Text>
            </View>
          </View>
        </View>   
        <View style={{height: 100}}>
          <LineGraph
            style={{
              position: 'absolute',
              top: 10,
              left: 0,
              right: 0,
              bottom: 10,
            }}
            points={pointData}
            animated={true}
            color={theme.colors.accent}
            lineThickness={3}
            horizontalPadding={0}
          />
          <LineGraph
            style={{
              position: 'absolute',
              top: 10,
              left: 0,
              right: 0,
              bottom: 10,
            }}
            points={pointData2}
            animated={true}
            color={theme.colors.opposite}
            //gradientFillColors={colorScheme == "dark" ? ['#0e8a5c', '#29292f']:['#0e8a5c', '#fff']}
            //onPointSelected={(p) => updateVals(p)}
            lineThickness={3}
            horizontalPadding={0}
          />
          </View>  
    </TouchableOpacity>
  );
};

export default GameCard;

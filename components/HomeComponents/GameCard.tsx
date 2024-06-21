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
import Timer from './Timer';
import GameCardSkeleton from './GameCardSkeleton';
import { Area, CartesianChart, Line, PointsArray, useLinePath } from 'victory-native';
import { Path, useFont } from '@shopify/react-native-skia';


const GameCard = (props: any) => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width);

  

  interface PortfolioSnapshot {
    value: number;
    timeField: number;
  }

  const [yourPointData, setYourPointData] = useState<GraphPoint[]>([]);
  const [opponentPointData, setOpponentPointData] = useState<any>([]);
  const [opponentUsername, setOpponentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [yourFormattedData, setYourFormattedData] = useState<any[]>([])
  const [formattedData2, setFormattedData2] = useState<any[]>([])
  const [minX, setMinX] = useState(0)
  const [maxX, setMaxX] = useState(0)
  const [minY, setMinY] = useState(0)
  const [maxY, setMaxY] = useState(0)
  const [referenceY, setReferenceY] = useState(0);
  const [y0, setY0] = useState<number>(0);

  const match = props.match;
  const userID = props.userID;

  const setUserMatchData = async (yourUserNumber: string, opponentUserNumber: string) => {
    try {
      const yourSnapshots: PortfolioSnapshot[] = match[yourUserNumber].snapshots;
      const yourPoints: GraphPoint[] = yourSnapshots.map((snapshot) => ({
        value: snapshot.value,
        date: new Date(snapshot.timeField), // Ensure date is in timestamp format
      }));
      setYourPointData(yourPoints);

      const oppSnapshots: PortfolioSnapshot[] = match[opponentUserNumber].snapshots;
      const oppPoints: GraphPoint[] = oppSnapshots.map((snapshot) => ({
        value: snapshot.value,
        date: new Date(snapshot.timeField), // Ensure date is in timestamp format
      }));
      setOpponentPointData(oppPoints);

      const response = await axios.post(serverUrl + '/getUsernameByID', { userID: match[opponentUserNumber].userID });
      console.log("Opp name:", opponentUserNumber)
      setOpponentUsername(response.data.username);
    } catch (error) {
      console.log('Game card error:', error);
    }
  };

  useEffect(() => {
    if (match.user1.userID === userID) {
      setUserMatchData('user1', 'user2');
    } else if (match.user2.userID === userID) {
      setUserMatchData('user2', 'user1');
    } else {
      console.error('Error determining whether active user is user1 or user2.');
    }
  }, [match]);

  // Log the state to check if data is populated
  useEffect(() => {
    const sourceData = opponentPointData.slice(0, 100).filter((item:any, index:any) => index % 2 === 0)
    const data = sourceData // Select every 10th item
    .map((item:any, index:number) => ({
      value: item.value - sourceData[0].value,
      index: index,
      date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
    }));
    setYourFormattedData(data)

    const sourceData2 = yourPointData.slice(0, 100).filter((item:any, index:any) => index % 2 === 0)
    const data2 = sourceData2 // Select every 10th item
    .map((item:any, index:number) => ({
      value: item.value - sourceData2[0].value,
      index: index,
      date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
    }));
    setFormattedData2(data2)

    const dataMax = Math.max(...data.map((item:any) => item.value))
    const data2Max = Math.max(...data2.map((item:any) => item.value))
    const dataMin = Math.min(...data.map((item:any) => item.value))
    const data2Min = Math.min(...data2.map((item:any) => item.value))

    if (data2Max > dataMax) {
      setMaxY(data2Max)
      console.log("Data: " + data2Max, dataMax)
    } else {
      setMaxY(dataMax)
      console.log("Data: " + data2Max, dataMax)
    }

    if (data2Min > dataMin) {
      setMinY(dataMin)
    } else {
      setMinY(data2Min)
    }

   
    setLoading(false);
  }, [yourPointData, opponentPointData, opponentUsername]);
  
  // Convert the date string to a format that Gifted Charts can use
  /*const formattedData = data.map(item => ({
    value: item.value,
    label: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
  }));*/

  const DATA = Array.from({ length: 50 }, (_, i) => ({
    index: i,
    value: 0
  }));

  const font = useFont(require('../../assets/fonts/InterTight-Black.ttf'), 9);

  return (
    <TouchableOpacity style={styles.gameCardContainer} onPress={() => navigation.navigate("GameScreen", {mode: match.mode, amountWagered: match.amountWagered, endAt: match.endAt})}>
      {loading ? (
        <View></View>
      ) : (
        <>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.gameCardAmountWageredContainer}>
              <Text style={styles.gameCardAmountWageredText}>${match.wagerAmt}</Text>
            </View>
            <View style={styles.gameCardModeContainer}>
              <Text style={styles.gameCardModeText}>{match.matchType}</Text>
            </View>
            <View style={{ flex: 1 }}></View>
            <Timer endDate={match.endAt} timeFrame={match.timeFrame} />
          </View>
          <View style={{ gap: 10, marginHorizontal: 10, marginTop: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <View style={[styles.gameCardIndicator, { backgroundColor: theme.colors.accent }]}></View>
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.gameCardPlayerText}>You</Text>
              </View>
              <View style={styles.gameCardPercentageContainer}>
                {/* TODO: Add in actual percentages */}
                <Text style={[styles.gameCardPercentageText, { color: theme.colors.accent }]}>$110,000 (10%)</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 5 }}>
              <View style={[styles.gameCardIndicator, { backgroundColor: theme.colors.stockDownAccent }]}></View>
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.gameCardPlayerText}>{opponentUsername}</Text>
              </View>
              <View style={styles.gameCardPercentageContainer}>
                <Text style={[styles.gameCardPercentageText, { color: theme.colors.stockDownAccent }]}>$105,200 (5.2%)</Text>
              </View>
            </View>
          </View>
          <View style={{ height: 200 }}>
            <View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
              <CartesianChart data={DATA} xKey="index" yKeys={["value"]}
              domain={{y: [minY, maxY]}}>
                {({ points }) => (
                   // Store the points for later use
                
                    <>
                      <Line points={points.value} color={theme.colors.opposite} 
                      strokeWidth={1} animate={{ type: "timing", duration: 300 }}/>
                    </>
                  
                )}
              </CartesianChart>
            </View>
            <View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
            <CartesianChart data={yourFormattedData} xKey="index" yKeys={["value"]} 
              domain={{y: [minY, maxY],
                x: [0, 100]
              }}>
              {({ points }) => (
              // 👇 and we'll use the Line component to render a line path.
                <>
                <Line points={points.value} color={theme.colors.stockUpAccent} 
                strokeWidth={2} animate={{ type: "timing", duration: 300 }}/>
                </>
              )}
            </CartesianChart>
            </View>
            {/*<View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
            <CartesianChart data={yourFormattedData} xKey="index" yKeys={["value"]} 
              domain={{y: [minY, maxY],
                x: [0, 100]
              }}>
              {({ points }) => (
              // 👇 and we'll use the Line component to render a line path.
                <Area
                points={points.value}
                y0={50}
                color="#013220"
                animate={{ type: "timing", duration: 300 }}
              />
              )}
            </CartesianChart>
            </View>*/}
            <View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
            <CartesianChart data={formattedData2} xKey="index" yKeys={["value"]}
              domain={{y: [minY, maxY],
                x: [0, 100]
              }}>
              {({ points }) => (
              // 👇 and we'll use the Line component to render a line path.
                <>
                <Line points={points.value} color={theme.colors.stockDownAccent} 
                strokeWidth={2} animate={{ type: "timing", duration: 300 }}/>
                </>
              )}
            </CartesianChart>
            </View>
            {/*<View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
            <CartesianChart data={formattedData2} xKey="index" yKeys={["value"]} 
              domain={{y: [minY, maxY],
                x: [0, 100]
              }}>
              {({ points, chartBounds }) => (
              // 👇 and we'll use the Line component to render a line path.
                <Area
                points={points.value}
                y0={50}
                color="#8B0000"
                animate={{ type: "timing", duration: 300 }}
              />
              )}
            </CartesianChart>
            </View>*/}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

export default GameCard;
import React, {useState, useEffect, useRef} from 'react';
import { Text, TouchableOpacity, View, useColorScheme} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {GraphPoint, LineGraph} from 'react-native-graph';
import {serverUrl, websocketUrl} from '../../constants/global';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import Timer from './Timer';
import GameCardSkeleton from './GameCardSkeleton';
import { Area, CartesianChart, Line, PointsArray, useLinePath } from 'victory-native';
import { Group, Path, useFont, Circle } from '@shopify/react-native-skia';
import HapticFeedback from "react-native-haptic-feedback";
import getCurrentPrice from '../../utility/getCurrentPrice';


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

  const [yourPointData, setYourPointData] = useState<any | null>(null);
  const [opponentPointData, setOpponentPointData] = useState<any | null>(null);
  const [opponentUsername, setOpponentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [yourFormattedData, setYourFormattedData] = useState<any[] | null>(null)
  const [oppFormattedData, setOppFormattedData] = useState<any[] | null>(null)
  const [minY, setMinY] = useState(0)
  const [maxY, setMaxY] = useState(0)
  const [yourColor, setYourColor] = useState("#fff")
  const [oppColor, setOppColor] = useState("#fff")
  const [yourAssets, setYourAssets] = useState<any[] | null>(null)
  const [opponentAssets, setOpponentAssets] = useState<any[] | null>(null)
  const [yourTickerPrices, setYourTickerPrices] = useState<{ [ticker: string]: number }>({});
  const [oppTickerPrices, setOppTickerPrices] = useState<{ [ticker: string]: number }>({});
  const [match, setMatch] = useState<any | null>(null)
  const [yourTotalPrice, setYourTotalPrice] = useState(0)
  const [oppTotalPrice, setOppTotalPrice] = useState(0)
  const [gotInitialPrices, setGotInitialPrices] = useState(false)
  
  const [you, setYou] = useState("")
  const [opp, setOpp] = useState("")

  const userID = props.userID;
  const matchID = props.matchID;


  const getMatchData = async () => {
    try {
      const matchDataResponse = await axios.post(serverUrl + '/getMatchData', { matchID: matchID });
      if (matchDataResponse) {
        console.log("About to set match, STEP 2 should run in a sec");
        setMatch(matchDataResponse.data)
      }
    } catch (error) {
      console.error('in get match data error' + error);
    }
  };

  const setUserMatchData = async (yourUserNumber: string, opponentUserNumber: string) => {
    try {
      // get portfolio snapshots
      const snapshots = await axios.post(serverUrl + '/getSnapshots', { matchID: match.matchID })

      const yourSnapshots: PortfolioSnapshot[] = snapshots.data[`${yourUserNumber}Snapshots`];
      
      const yourPoints: GraphPoint[] = yourSnapshots.map((snapshot) => ({
        value: snapshot.value,
        date: new Date(snapshot.timeField), // Ensure date is in timestamp format
      }));

      console.log("About to set your point data");
      

      const oppSnapshots: PortfolioSnapshot[] = snapshots.data[`${opponentUserNumber}Snapshots`];
      const oppPoints: GraphPoint[] = oppSnapshots.map((snapshot) => ({
        value: snapshot.value,
        date: new Date(snapshot.timeField), // Ensure date is in timestamp format
      }));
      

 
      //console.log("YOUR ASSETS",match[yourUserNumber].assets)
      //console.log("OPP ASSETS",match[opponentUserNumber].assets)
      console.log("YOUR ASSETS FROM MATCH OBJECT:", match[yourUserNumber].assets)

      setYourAssets(match[yourUserNumber].assets)
      setOpponentAssets(match[opponentUserNumber].assets)
      
      setYourPointData(yourPoints);
      setOpponentPointData(oppPoints);

      const response = await axios.post(serverUrl + '/getUsernameByID', { userID: match[opponentUserNumber].userID });
      setOpponentUsername(response.data.username);
    } catch (error) {
      console.log('Game card error:', error);
    }
  };

  const setData = async () => {
    if (match.user1.userID === userID) {
      setUserMatchData('user1', 'user2');
      setYou('user1')
      setOpp('user2')
    } else if (match.user2.userID === userID) {
      setUserMatchData('user2', 'user1');
      setYou('user2')
      setOpp('user1')
    } else {
      console.error('Error determining whether active user is user1 or user2.');
    }
    //await getInitialPrices() 
  }

  const formatData = async () => {
    const sourceData = yourPointData.filter((item:any, index:any) => index % 2 === 0)
    const data = sourceData // Select every 10th item
    .map((item:any, index:number) => ({
      value: item.value,
      normalizedValue: item.value - 100000,
      index: index,
      date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
    }));
    setYourFormattedData(data)

    const sourceData2 = opponentPointData.filter((item:any, index:any) => index % 2 === 0)
    const data2 = sourceData2 // Select every 10th item
    .map((item:any, index:number) => ({
      value: item.value,
      normalizedValue: item.value - 100000,
      index: index,
      date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
    }));
    //console.log("DATA 2 TO BECOME OPP FOMRATTED DATA:", data2)
    setOppFormattedData(data2)

    const dataMax = Math.max(...data.map((item:any) => item.normalizedValue))
    const data2Max = Math.max(...data2.map((item:any) => item.normalizedValue))
    const dataMin = Math.min(...data.map((item:any) => item.normalizedValue))
    const data2Min = Math.min(...data2.map((item:any) => item.normalizedValue))
    

    if (data2Max > dataMax) {
      setMaxY(data2Max)
      //console.log("Data: " + data2Max, dataMax)
    } else {
      setMaxY(dataMax)
      //console.log("Data: " + data2Max, dataMax)
    }

    if (data2Min > dataMin) {
      setMinY(dataMin)
    } else {
      setMinY(data2Min)
    }

    console.log("About to run STEP 4");
    await getInitialPrices();
    console.log("Just ran step 4");
  }

  // grab updated match data every time gamecard comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("------------------------------------------------------------------")
      console.log("STEP 1: GETTING MATCH DATA FROM MONGO")
      getMatchData()
      console.log("POST STEP 1: Just got match data");
    }, [])
  )

  //sets match data (i.e. point data, other username)
  useFocusEffect(
    React.useCallback(() => {
      if (match) {
        console.log("STEP 2: SETTING UNFORMATTED POINT DATA")
        setData();
      }
    }, [match])
  );

  // Log the state to check if data is populated
  useEffect(() => {
    console.log("Just ran useEffect triggered by change in yourPointData");
    if (yourPointData && yourAssets && opponentPointData && opponentAssets) { //setData() was good
      console.log("STEP 3: SETTING FORMATTED DATA")
      formatData()
    }
  }, [opponentPointData]);

  const getInitialPrices = async () => {
    console.log("Your Assets before getting initial prices", yourAssets)
    console.log("Opp Assets before getting initial prices", opponentAssets)
    if (yourAssets && opponentAssets) {
      try {
        const yourInitialTickerPromises = yourAssets.map(async (item) => {
          const currentPrice = await getCurrentPrice(item.ticker);
          return { ticker: item.ticker, currentPrice };
        });
    
        const yourInitialTickerPricesArray:any = await Promise.all(yourInitialTickerPromises);
        const yourInitialTickerPrices = yourInitialTickerPricesArray.reduce((acc:any, item:any) => {
          acc[item.ticker] = item.currentPrice;
          return acc;
        }, {});
    
        setYourTickerPrices(yourInitialTickerPrices);
    
        const oppInitialTickerPromises = opponentAssets.map(async (item) => {
          const currentPrice = await getCurrentPrice(item.ticker);
          return { ticker: item.ticker, currentPrice };
        });
    
        const oppInitialTickerPricesArray:any = await Promise.all(oppInitialTickerPromises);
        const oppInitialTickerPrices = oppInitialTickerPricesArray.reduce((acc:any, item:any) => {
          acc[item.ticker] = item.currentPrice;
          return acc;
        }, {});
    
        setOppTickerPrices(oppInitialTickerPrices);
        //console.log("Your Prices", yourInitialTickerPrices)
        //console.log("Opp Prices", oppInitialTickerPrices)
        console.log("STEP 4: SETTING INITIAL PRICES FOR HELD ASSETS")
        setGotInitialPrices(true);
      } catch (error) {
        console.error('Error fetching initial prices:', error);
      }
  };
}

  useEffect(() => {
    if (yourFormattedData != null && oppFormattedData != null) {
      //check if the formatteddatas have any value //TODO when there is no formatted data so jackson make snapshot always be added at match creation
      if (yourFormattedData[yourFormattedData.length-1]?.value != undefined && oppFormattedData[oppFormattedData.length-1]?.value != undefined) {
        //INTIALIZATION OF COLOR AND PRICES
        setYourTotalPrice(yourFormattedData[yourFormattedData.length-1].value)
        //console.log("Opp formatted data", oppFormattedData);

        setOppTotalPrice(oppFormattedData[oppFormattedData.length-1].value)
        if (yourFormattedData[yourFormattedData.length-1].value >= oppFormattedData[oppFormattedData.length-1].value) {
          setYourColor(theme.colors.stockUpAccent)
          setOppColor(theme.colors.tertiary)
        } else {
          setYourColor(theme.colors.stockDownAccent)
          setOppColor(theme.colors.tertiary)
        }
        //getInitialPrices() 
      }
    } else {
      setLoading(true)
    }
  }, [yourFormattedData, oppFormattedData])

  useEffect(() => {
    if (gotInitialPrices == true) {
      console.log("STEP 5: INITIAL PRICES WERE SET")
      //console.log(yourTickerPrices)
      setLoading(false)
    }
  }, [gotInitialPrices])

  //ALL SOCKET STUFF ---------------------------------------
  function uint8ArrayToString(array:any) {
      return array.reduce((data:any, byte:any) => data + String.fromCharCode(byte), '');
  }

  function getNewTickerObject(jsonMessage:any, yourAssets:any) {
    // Convert yourAssets to a map for quick lookup
    const yourAssetsMap = new Map(yourAssets.map((asset:any) => [asset.ticker, asset]));
  
    // Iterate through JSONMessage to find a new object
    for (const company of jsonMessage) {
      if (!yourAssetsMap.has(company.ticker)) {
        return company;
      }
    }
  
    // If no new object is found, return null
    return null;
  }

  const ws = useRef<WebSocket | null>(null);

  const [retries, setRetries] = useState(0);

  const MAX_RETRIES = 5;  // Maximum number of retry attempts
  const RETRY_DELAY = 2000; // Delay between retries in milliseconds


  /*useEffect(() => {
    console.log("YOUR ASSETS:", yourAssets)
    console.log("OPP ASSETS:", opponentAssets)
  }, [yourAssets, opponentAssets])*/
  
  const setupSocket = async () => {    
    console.log("Opening socket with url:", websocketUrl);  
    const socket = new WebSocket(websocketUrl);

    ws.current = socket;
    
    ws.current.onopen = () => {
        console.log(`Connected to GameCard Asset Websocket, but not ready for messages...`);
        if (ws.current! && yourAssets && opponentAssets) {
          console.log(`Connection for GameCard Asset Websocket is open and ready for messages`);
          // first send match ID
          ws.current!.send(JSON.stringify({ matchID: match.matchID }))
          yourAssets.forEach((asset:any) => {
            ws.current!.send(JSON.stringify({ ticker: asset.ticker}));
          })
          opponentAssets.forEach((asset:any) => {
            ws.current!.send(JSON.stringify({ ticker: asset.ticker}));
          })
        } else {
          console.log('WebSocket is not open');
        }
    };

      // WebSocket message handling
      ws.current.onmessage = (event) => {
        const buffer = new Uint8Array(event.data);

        if (event.data == "Websocket connected successfully") {
          return;
        }

        

        const message = uint8ArrayToString(buffer); 

        try {
          const JSONMessage = JSON.parse(message);
          //console.log(JSONMessage)
          if (JSONMessage.type == "updatedAssets") {
            // Handle updated assets
            console.log("INSIDE UPDATED ASSETS!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            const yourUpdatedAssets = JSONMessage[`${you}Assets`];
            const oppUpdatedAssets = JSONMessage[`${opp}Assets`];

            const yourNewAsset = getNewTickerObject(yourUpdatedAssets, yourAssets);
            const oppNewAsset = getNewTickerObject(oppUpdatedAssets, opponentAssets);
            
            // both cases
            setYourAssets(yourUpdatedAssets);
            setOpponentAssets(oppUpdatedAssets);

            if (yourNewAsset) {
              console.log("YOUR NEW ASSET JUST BOUGHT:", yourNewAsset)
              if (ws.current) {
                console.log("SUBSCRIBING TO YOUR NEW ASSET:", yourNewAsset.ticker)
                ws.current.send(JSON.stringify({ ticker: yourNewAsset.ticker }));
              }
            }

            if (oppNewAsset) {
              console.log("OPP NEW ASSET JUST BOUGHT:", oppNewAsset)
              if (ws.current) {
                console.log("SUBSCRIBING TO OPP NEW ASSET:", oppNewAsset.ticker)
                ws.current.send(JSON.stringify({ ticker: oppNewAsset.ticker }));
              }
            }

     
            console.log("Updated your assets state:", yourUpdatedAssets);

            console.log("Updated opp assets state:", oppUpdatedAssets);;

          } else if (message != "" && gotInitialPrices && yourAssets && opponentAssets) {
            //console.log(JSONMessage)
            const { sym, c: currentPrice } = JSONMessage[0];
            const isTickerInYourAssets = yourAssets.some(stock => stock.ticker === sym);
            const isTickerInOppAssets = opponentAssets.some(stock => stock.ticker === sym);
            //console.log(yourAssets)
            if (isTickerInYourAssets) {
              setYourTickerPrices(prevPrices => ({
                ...prevPrices,
                [sym]: currentPrice,
              }));
            }

            if (isTickerInOppAssets) {
              setOppTickerPrices(prevPrices => ({
                ...prevPrices,
                [sym]: currentPrice,
              }));
            }
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };


    ws.current.onerror = (error) => {
        console.log('WebSocket error:', error || JSON.stringify(error));
        if (retries < MAX_RETRIES) {
          console.log(`Retrying connection (${retries + 1}/${MAX_RETRIES})...`);
          setRetries(retries + 1);
          setTimeout(() => {
              setupSocket();
          }, RETRY_DELAY);
        } else {
          console.error('Maximum retry attempts reached. Unable to connect to WebSocket.');
        }
    };

    ws.current.onclose = () => {
        console.log(`Connection to GameCard Asset Websocket closed`);
    };
  };

  // This is now useFocusEffect instead of useEffect
  // runs the callback function every time screen is put into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Game card in focus");
      // Do something while screen is focused

      if (loading == false) {
        console.log("Focus Assets:", yourAssets)
        setupSocket();
        
        // cleanup code when screen is no longer focused
      }
      return () => {
        // make loading true
        console.log("Game card out of focus");
        if (ws.current) {
          setYourPointData(null)
          setOpponentPointData(null)
          setYourFormattedData(null)
          setOppFormattedData(null)
          setYourAssets(null)
          setOpponentAssets(null)
          setYourTickerPrices({})
          setOppTickerPrices({})
          setMatch(null)
          setGotInitialPrices(false);
          setLoading(true)
          ws.current.close(1000, 'Closing websocket connection due to page being closed');
          ws.current = null;  // Ensure the reference is cleared
        }
    };
    }, [loading])
  );

  //sets total live prices for each user
  useEffect(() => {
    //console.log("Ticker Prices: ", tickerPrices)
    if (!loading && yourAssets && opponentAssets && gotInitialPrices) {
    let yourTotalLivePrice = 0;
    yourAssets.forEach(asset => {
      if (yourTickerPrices[asset.ticker]) {
        const livePrice = yourTickerPrices[asset.ticker] * asset.totalShares;
        yourTotalLivePrice += livePrice;
      } else {
        //console.log(`Ticker price for ${asset.ticker} not found`);
      }
    });
    setYourTotalPrice(yourTotalLivePrice + match[you]?.buyingPower)
    if (yourFormattedData) {
      yourFormattedData[yourFormattedData.length-1].normalizedValue = yourTotalLivePrice + match[you]?.buyingPower - 100000
    }

    let oppTotalLivePrice = 0;
    opponentAssets.forEach(asset => {
      if (oppTickerPrices[asset.ticker]) {
        const livePrice = oppTickerPrices[asset.ticker] * asset.totalShares;
        oppTotalLivePrice += livePrice;
      } else {
        //console.log(`Ticker price for ${asset.ticker} not found`);
      }
    });
    setOppTotalPrice(oppTotalLivePrice + match[opp]?.buyingPower)
    if (oppFormattedData) {
      oppFormattedData[oppFormattedData.length-1].normalizedValue = oppTotalLivePrice + match[opp]?.buyingPower - 100000
    }
    /**/
    if (yourFormattedData && oppFormattedData) {
      //console.log(yourTotalLivePrice, oppTotalLivePrice)
      if (yourTotalLivePrice + match[you]?.buyingPower >= oppTotalLivePrice + match[opp]?.buyingPower) {
        setYourColor(theme.colors.stockUpAccent)
        setOppColor(theme.colors.tertiary)

      } else {
        setYourColor(theme.colors.stockDownAccent)
        setOppColor(theme.colors.tertiary)
      }
      const yourMax = Math.max(...yourFormattedData.map((item:any) => item.normalizedValue))
      const oppMax = Math.max(...oppFormattedData.map((item:any) => item.normalizedValue))
      const yourMin = Math.min(...yourFormattedData.map((item:any) => item.normalizedValue))
      const oppMin = Math.min(...oppFormattedData.map((item:any) => item.normalizedValue))
      

      if (oppMax > yourMax) {
        setMaxY(oppMax)
        //console.log("Data: " + data2Max, dataMax)
      } else {
        setMaxY(yourMax)
        //console.log("Data: " + data2Max, dataMax)
      }

      if (oppMin > yourMin) {
        setMinY(yourMin)
      } else {
        setMinY(oppMin)
      }
    }
  }
}, [yourTickerPrices, oppTickerPrices, yourAssets, opponentAssets])
  //END OF SOCKET STUFF--------------------------------------------------------

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

  function LiveIndicator({ x, y, color }: { x: number, y: number, color: any }) {
    return (
      <Group>
        <Circle cx={x} cy={y} r={12} color={color} opacity={0.05} />
        <Circle cx={x} cy={y} r={7} color={color} opacity={0.2} />
        <Circle cx={x} cy={y} r={3} color={color}/>
      </Group>
    );
  }
  
  const length = 10;
  const arrayWithZeroValues = Array.from({ length }, (_, index) => ({ index, value: 0 }));


  return (
    <View>
    {!loading && match ?
    <TouchableOpacity style={styles.gameCardContainer} onPress={() => {
      navigation.navigate("GameScreen", {matchID: match.matchID, userID: props.userID, endAt: match.endAt})
      
        HapticFeedback.trigger("impactMedium", {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false
        });
      }
      
      }>
        <View style={{borderRadius: 8}}>
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
          <View style={{ gap: 10, marginHorizontal: 10, marginTop: 10, flex: 1, flexDirection: 'row'}}>
            <View>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <View style={[styles.gameCardIndicator, { backgroundColor: yourColor }]}></View>
                <View style={{ justifyContent: 'center' }}>
                  <Text style={styles.gameCardPlayerText}>You</Text>
                </View>
                {/*<View style={styles.gameCardPercentageContainer}>
                  <Text style={[styles.gameCardPercentageText, { color: yourColor }]}>${(yourTotalPrice).toFixed(2)} ({((yourTotalPrice-100000)/(0.01*100000)).toFixed(2)}%)</Text>
                </View>*/}
              </View>
              <View style={styles.gameCardPercentageContainer}>
                  <Text style={[styles.gameCardPercentageText, { color: yourColor }]}>${(yourTotalPrice).toFixed(2)} ({((yourTotalPrice-100000)/(0.01*100000)).toFixed(2)}%)</Text>
              </View>
            </View>
            <View style={{flex: 1}}></View>
            <View>
              <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                <View style={{flex: 1}}></View>
                <View style={{ justifyContent: 'center' }}>
                  <Text style={styles.gameCardPlayerText}>{opponentUsername}</Text>
                </View>
                <View style={[styles.gameCardIndicator, { backgroundColor: theme.colors.opposite }]}></View>
              </View>
              <View style={styles.gameCardPercentageContainer}>
                  <Text style={[styles.gameCardPercentageText, { color: theme.colors.opposite }]}>${(oppTotalPrice).toFixed(2)} ({((oppTotalPrice-100000)/(0.01*100000)).toFixed(2)}%)</Text>
              </View>
            </View>
          </View>
          <View style={{ height: 190}}>
          <View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
                {/*reference line*/}
                <CartesianChart data={arrayWithZeroValues} xKey="index" yKeys={["value"]} domain={{y: [minY, maxY]}}>
                    {({ points }) => {
                    return (
                    <>
                      <Group>
                      <Line points={points.value} color={theme.colors.tertiary} 
                      strokeWidth={1} animate={{ type: "timing", duration: 300 }} curveType='linear'></Line>
                      </Group>
                    </>
                    )
                  
                  }}
                </CartesianChart>
              </View>
            <View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
            <CartesianChart data={oppFormattedData!} xKey="index" yKeys={["normalizedValue"]}
              domain={{y: [minY, maxY],
                x: [0, oppFormattedData!.length/(((match.timeframe*1000) - ((new Date(match.endAt)).getTime() - Date.now()))/(match.timeframe*1000))]
              }}>
              {({ points }) => (
              // 👇 and we'll use the Line component to render a line path.
                <>
                <Line points={points.normalizedValue} color={hexToRGBA(oppColor, 0.5)} 
                strokeWidth={2} animate={{ type: "timing", duration: 300 }}/>
                <LiveIndicator x={points.normalizedValue[points.normalizedValue.length-1].x}
                y={points.normalizedValue[points.normalizedValue.length-1].y!}
                color={hexToRGBA(oppColor, 0.5)}
                />
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
            <CartesianChart data={yourFormattedData!} xKey="index" yKeys={["normalizedValue"]} 
              domain={{y: [minY, maxY],
                x: [0, yourFormattedData!.length/(((match.timeframe*1000) - ((new Date(match.endAt)).getTime() - Date.now()))/(match.timeframe*1000))]
              }}>  
              {({ points }) => (
              // 👇 and we'll use the Line component to render a line path.
                <>
                <Line points={points.normalizedValue} color={yourColor} 
                strokeWidth={2} animate={{ type: "timing", duration: 300 }}/>
                <LiveIndicator x={points.normalizedValue[points.normalizedValue.length-1].x}
                y={points.normalizedValue[points.normalizedValue.length-1].y!}
                color={yourColor}
                />
                </>
              )}
            </CartesianChart>
            </View>
          </View>
        </View>
    </TouchableOpacity>
    : <GameCardSkeleton/>}
    </View>
  );
};

export default GameCard;
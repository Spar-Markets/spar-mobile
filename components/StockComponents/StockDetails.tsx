import React, {useState, useEffect} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  NativeModules,
  ScrollView,
  Linking,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {serverUrl} from '../../constants/global';
import StockDetailGraph from './StockDetailGraph';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import PageHeader from '../GlobalComponents/PageHeader';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockStyles from '../../styles/createStockStyles';
import NewsCard from './NewsCard';
import timeAgo from '../../utility/timeAgo';
import { Skeleton } from '@rneui/base';
import { useSelector } from 'react-redux';
import useUserDetails from '../../hooks/useUserDetails';
import { TextDecoder } from 'util';
import Timer from '../HomeComponents/Timer';
import createGlobalStyles from '../../styles/createGlobalStyles';
import HTHPageHeader from '../GlobalComponents/HTHPageHeader';
import {polygonKey} from '../../constants/global'
import postSlice from '../../GlobalDataManagment/postSlice';

// interface for RouteParams, so we can expect the format of the params being passed in
// when you navigate to this page. (just an object with a ticker)
interface RouteParams {
  ticker: string;
  tradable: boolean;
  canSell: boolean;
  matchID: string;
  buyingPower: number;
  inGame: boolean
}

// apply stockdetails props interface so it knows its formatted correctly
const StockDetails = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const route = useRoute();
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [ticker, setTicker] = useState('');
  const [timeFrameSelected, setTimeFrameSelected] = useState('1D');
  const [tickerData, setTickerData] = useState<any>(null);
  const [livePrice, setPassingLivePrice] = useState<any>(null);
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width)
  const [isExpanded, setIsExpanded] = useState(false)

  const { userData } = useUserDetails()

  const [loading, setLoading] = useState(true)
  const [isWatchingStock, setIsWatchingStock] = useState<any>(null)

  function formatLargeNumber(number: number) {
    if (number >= 1e12) {
      return (number / 1e12).toFixed(2) + ' trillion';
    } else if (number >= 1e9) {
      return (number / 1e9).toFixed(2) + ' billion';
    } else if (number >= 1e6) {
      return (number / 1e6).toFixed(2) + ' million';
    } else if (number >= 1e3) {
      return (number / 1e3).toFixed(2) + ' thousand';
    } else {
      return number.toString();
    }
  }

  // get params either in the expected format, or allow it to be undefined
  const params = route.params as RouteParams | undefined;

  const checkIfStockIsWatched = async () => {
    try {
        const response = await axios.post(serverUrl + '/isWatchedStock', {
          userID: userData?.userID,
          ticker: params?.ticker,
        });
        //console.log("STOCK CONSOLE LOG:", response.data)
        //console.log("USERID:", userData?.userID)
        //console.log("TICKER IN WATCH:", params?.ticker)
        setIsWatchingStock(response.data);
    } catch(error) {
      console.log('ERROR CHECKING IF STOCK IN WATCHLIST:', error);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await checkIfStockIsWatched()
        const tickerResponse = await axios.post(serverUrl + '/getTickerDetails', {
          ticker: params?.ticker,
        });
        if (tickerResponse) {
          setTickerData(tickerResponse.data);
        }
      } catch {
        console.error('Error getting details in StockDetails.tsx');
      } finally {
        setLoading(false);
      }
    };

    if (userData?.userID) {
      setTicker(params?.ticker || '');
      fetchData();
    }
  }, [userData]);

  useEffect(() => {
    if (tickerData != null && isWatchingStock != null) {
      //console.log("FINAL USE EFFECT STOCK:", isWatchingStock)
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [isWatchingStock])

  const toggleWatchStock = async () => {
    try {
      setIsWatchingStock(!isWatchingStock)
      if (isWatchingStock) {
        const watchStockResponse = await axios.post(serverUrl+"/unwatchStock", 
          {userID: userData?.userID, ticker: tickerData.detailsResponse.results.ticker})
        console.log(watchStockResponse.data)
      } else {
        const watchStockResponse = await axios.post(serverUrl+"/watchStock", 
          {userID: userData?.userID, ticker: tickerData.detailsResponse.results.ticker})
        console.log(watchStockResponse.data)
      }
    } catch {
      console.log("error watching stock")
    }
  }

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      {!loading && (
        <View style={{flex: 1}}>
          <View style={styles.stockDetailsContainer}>
            {params?.inGame ? <HTHPageHeader endAt={Date.now() + 900000}/> : <PageHeader/>}
            {/*params?.inGame != true && <View style={{}}>
              
              {isWatchingStock ? 
                <TouchableOpacity style={styles.headerRightBtn} onPress={toggleWatchStock}>
                  <Icon name="star" style={{color: "#fac61e"}} size={28}/> 
                </TouchableOpacity> : 
                <TouchableOpacity style={styles.headerRightBtn} onPress={toggleWatchStock}>
                  <Icon name="star-o" style={{color: theme.colors.opposite}} size={28}/>
                </TouchableOpacity>}
              
            
              </View>*/}
            {tickerData != null && params != undefined ? (
              <ScrollView style={{paddingBottom: 60}} showsVerticalScrollIndicator={false}>
                <View>
                  <StockDetailGraph ticker={ticker} livePrice={livePrice} timeframe={timeFrameSelected} name={tickerData.detailsResponse.results.name} logoUrl={tickerData.detailsResponse.results.branding.icon_url + "?apiKey=" + polygonKey}/>
                </View>
                <View style={{marginHorizontal: 25, marginTop: 10}}>
                  <Text style={styles.subjectLabel}>Overview</Text>
                  <Text style={styles.overviewText}>
                    {isExpanded
                      ? tickerData.detailsResponse.results.description
                      : `${tickerData.detailsResponse.results.description.substring(0, 200)}...`}
                  </Text>
                  <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.showMoreButtonText}>
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </Text>
                    {isExpanded ? <Icon name="caret-up" style={[styles.icon, { marginLeft: 5 }]} size={18}/> :
                    <Icon name="caret-down" style={[styles.icon, { marginLeft: 5 }]} size={18} />}
                  </TouchableOpacity>
                </View>
                <View style={{marginTop: 15, marginHorizontal: 25}}>
                  <Text style={styles.subjectLabel}>Statistics</Text>
                  <View style={{flexDirection: 'row', marginTop: 5}}>
                    <View style={{flex: 0.7, gap: 10}}>
                      <View>
                        <Text style={styles.statType}>Open</Text>
                        <Text style={styles.statData}>${tickerData.priceDetails.open}</Text>
                      </View>
                      <View>
                        <Text style={styles.statType}>Today's High</Text>
                        <Text style={styles.statData}>${tickerData.priceDetails.high}</Text>
                      </View>
                      <View>
                        <Text style={styles.statType}>Today's Low</Text>
                        <Text style={styles.statData}>${tickerData.priceDetails.low}</Text>
                      </View>
                      <View>
                        <Text style={styles.statType}>Today's Volume</Text>
                        <Text style={styles.statData}>{formatLargeNumber(tickerData.priceDetails.volume)}</Text>
                      </View>
                    </View>
                    <View style={{gap: 10}}>
                      <View>
                        <Text style={styles.statType}>Market Cap</Text>
                        <Text style={styles.statData}>${formatLargeNumber(tickerData.detailsResponse.results.market_cap)}</Text>
                      </View>
                      <View>
                        <Text style={styles.statType}>52 Wk High</Text>
                        <Text style={styles.statData}></Text>
                      </View>
                      <View>
                        <Text style={styles.statType}>52 Wk Low</Text>
                        <Text style={styles.statData}></Text>
                      </View>
                      <View>
                        <Text style={styles.statType}>Avg. Volume</Text>
                        <Text style={styles.statData}></Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{marginTop: 20, paddingBottom: 130}}>
                  <View style={{flexDirection:'row', alignItems: 'center', marginRight: 20}}>
                    <Text style={[styles.subjectLabel, {marginLeft: 25}]}>News</Text>
                    <View style={{flex: 1}}></View>
                    <TouchableOpacity style={{paddingVertical: 5, paddingLeft: 10}}>
                      <Text style={styles.showMoreButtonText}>View More</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View style={{flexDirection: 'row', paddingLeft: 20}}>
                    {tickerData.news.results
                    .slice(0, 3)
                    .map((item: any, index: any) => (
                      <View key={index} style={{marginTop: 10, marginRight: 10}}>
                        {item && 'title' in item && 'publisher' in item && (
                          <NewsCard 
                            publisherName={item.publisher.name}
                            title={item.title}
                            article_url={item.article_url}
                            image_url={item.image_url}
                            timeAgo={timeAgo(new Date(item.published_utc))}
                          />
                        )}
                      </View>
                    ))}
                    </View>
                  </ScrollView>
                </View>
              </ScrollView>
            ) : (
              <View></View>
            )}
          </View>
          {params?.inGame == true &&
          <View style={styles.TradeButtonContainer}>
            <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate("StockOrder", {isBuying: true, ticker: params?.ticker, matchID: params?.matchID, buyingPower: params?.buyingPower})}>
              <Text style={styles.buyButtonText}>Buy</Text>
            </TouchableOpacity>
          </View>
          }
        </View>
      )}
    </View>
  );
};

export default StockDetails;

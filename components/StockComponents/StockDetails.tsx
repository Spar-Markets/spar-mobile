import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
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
import { polygonKey } from '../../constants/global';
import postSlice from '../../GlobalDataManagment/postSlice';
import CustomActivityIndicator from '../GlobalComponents/CustomActivityIndicator';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import CreateWatchlistButton from '../HomeComponents/CreateWatchlistButton';
import WatchlistButton from '../HomeComponents/WatchlistButton';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { RootState } from '../../GlobalDataManagment/store';

// interface for RouteParams, so we can expect the format of the params being passed in
// when you navigate to this page. (just an object with a ticker)
interface RouteParams {
  ticker: string;
  matchID: string;
  buyingPower: number;
  inGame: boolean;
  assets: Array<any>;
  owns: boolean;
  qty: number;
  endAt: Date;
  name: string;
}

// apply stockdetails props interface so it knows its formatted correctly
const StockDetails = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const route = useRoute();
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState<any>('')
  const [timeFrameSelected, setTimeFrameSelected] = useState('1D');
  const [tickerData, setTickerData] = useState<any>(null);
  const [livePrice, setPassingLivePrice] = useState<any>(null);
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);
  const [isExpanded, setIsExpanded] = useState(false);

  const user = useSelector((state: any) => state.user)

  const [loading, setLoading] = useState(true);
  const [isWatchingStock, setIsWatchingStock] = useState<any>(null);

  const [watchLists, setWatchLists] = useState<Object[]>([]);

  const [queueToAdd, setQueueToAdd] = useState<string[]>([]);

  const [currentStockPrice, setCurrentStockPrice] = useState<number>(0);

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
        userID: user.userID,
        ticker: params?.ticker,
      });
      //console.log("STOCK CONSOLE LOG:", response.data)
      //console.log("USERID:", userData?.userID)
      //console.log("TICKER IN WATCH:", params?.ticker)
      //setIsWatchingStock(response.data);
    } catch (error) {
      console.log('ERROR CHECKING IF STOCK IN WATCHLIST:', error);
    }
  };

  const [currentAccentColorValue, setCurrentAccentColorValue] = useState(
    theme.colors.primary,
  );

  const [asset, setAsset] = useState<any | null>(null);
  const [owns, setOwns] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const stockPrice = useSelector((state: RootState) => state.stock.stockPrice);

  useEffect(() => {
    if (params?.assets) {
      //console.log(params?.assets);
      setAsset(params?.assets.find((asset: any) => asset.ticker === ticker));
      setOwns(asset != undefined);
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      //console.log('Params', params);
      setLoading(true);
      try {
        await checkIfStockIsWatched();
        const tickerResponse = await axios.post(
          serverUrl + '/getTickerDetails',
          {
            ticker: params?.ticker,
          },
        );
        if (tickerResponse) {
          //console.log(tickerResponse.data.priceDetails);
          setTickerData(tickerResponse.data);
        }
      } catch {
        console.error('Error getting details in StockDetails.tsx');
      }
      setLoading(false);
    };

    if (user.userID) {
      setTicker(params?.ticker || '');
      fetchData();
    }
  }, [user, params]);

  /*useEffect(() => {
    if (user) {
      setWatchLists(userData.watchLists);
    }
  }, [userData]);*/

  const handleQueueChange = (watchListName: string) => {
    setQueueToAdd(prevQueue => {
      if (prevQueue.includes(watchListName)) {
        console.log(prevQueue.filter(name => name !== watchListName));
        return prevQueue.filter(name => name !== watchListName);
      } else {
        console.log([...prevQueue, watchListName]);
        return [...prevQueue, watchListName];
      }
    });
  };

  const addToWatchlist = async () => {
    if (user.userID) {
      try {
        console.log('Send waitlist straight to the moon');
        console.log('UserID:', user.userID);
        console.log('watchListNames', queueToAdd);
        console.log('stockTicker:', ticker);
        const response = await axios.post(serverUrl + '/addToWatchList', {
          userID: user.userID,
          watchListNames: queueToAdd,
          stockTicker: ticker,
        });
        if (response.status === 200) {
          closeListMenu();
        }
      } catch (error) {
        console.log('Error:', error);
      }
    }
  };

  const expandListMenu = async () => {
    try {
      bottomSheetRef.current?.expand(); // Expand the Bottom Sheet when star is clicked
    } catch {
      console.log('error watching stock');
    }
  };

  const closeListMenu = async () => {
    try {
      bottomSheetRef.current?.close(); // Expand the Bottom Sheet when star is clicked
    } catch {
      console.log('error watching stock');
    }
  };

  const handleSheetChanges = useCallback((index: number) => {
    //console.log('handleSheetChanges', index);
  }, []);

  // if (loading) {
  //   return (
  //     <View style={{flex: 1, backgroundColor: theme.colors.background}}>

  //     </View>
  //   );
  // }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {ticker != '' && params &&
        <View style={{ flex: 1 }}>
          <View style={styles.stockDetailsContainer}>
            {params?.inGame ? (
              <HTHPageHeader endAt={params?.endAt} />
            ) : (
              <PageHeader />
            )}
            <ScrollView
              style={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}>
              <View>
                <StockDetailGraph
                  setCurrPrice={setCurrentStockPrice}
                  ticker={ticker}
                  timeframe={timeFrameSelected}
                  name={params?.name}
                  logoUrl={
                    tickerData && tickerData.detailsResponse.results.branding != undefined
                      ? tickerData.detailsResponse.results.branding.icon_url +
                      '?apiKey=' +
                      polygonKey
                      : 'logoUrlError'
                  }
                  currentAccentColorValue={currentAccentColorValue}
                  setCurrentAccentColorValue={setCurrentAccentColorValue}
                />
              </View>

              <>
                {(owns == true || params?.owns == true) && (
                  <View style={{ marginHorizontal: 25, marginTop: 10 }}>
                    <Text style={styles.subjectLabel}>Position</Text>
                    <View style={{ flexDirection: 'row', marginTop: 5 }}>
                      <View style={{ flex: 0.7, gap: 10 }}>
                        <View>
                          <Text style={styles.statType}>Shares</Text>
                          {asset && (
                            <Text style={styles.statData}>
                              {asset.totalShares}
                            </Text>
                          )}
                        </View>
                        <View>
                          <Text style={styles.statType}>Avg. Cost</Text>
                          {asset && (
                            <Text style={styles.statData}>
                              ${asset.avgCostBasis.toFixed(2)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ gap: 10 }}>
                        <View>
                          <Text style={styles.statType}>Mkt Value</Text>
                          {asset && <Text style={styles.statData}>${(asset.totalShares * stockPrice!).toFixed(2)}</Text>}
                        </View>
                        <View>
                          <Text style={styles.statType}>Match Return</Text>
                          {asset && <Text style={styles.statData}>{((asset.totalShares * stockPrice!) - (asset.totalShares * asset.avgCostBasis)).toFixed(2)}</Text>}
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                <View style={{ marginHorizontal: 25, marginTop: 10 }}>
                  <Text style={styles.subjectLabel}>Overview</Text>
                  {tickerData != null ?
                    <>
                      <Text style={styles.overviewText}>
                        {isExpanded
                          ? tickerData?.detailsResponse?.results?.description
                          : `${tickerData?.detailsResponse?.results?.description?.substring(
                            0,
                            200,
                          ) || 'No description available.'
                          }...`}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setIsExpanded(!isExpanded)}
                        style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.showMoreButtonText}>
                          {isExpanded ? 'Show Less' : 'Show More'}
                        </Text>
                        {isExpanded ? (
                          <Icon
                            name="caret-up"
                            style={[styles.icon, { marginLeft: 5 }]}
                            size={18}
                          />
                        ) : (
                          <Icon
                            name="caret-down"
                            style={[styles.icon, { marginLeft: 5 }]}
                            size={18}
                          />
                        )}
                      </TouchableOpacity>
                    </> : <Skeleton animation={"pulse"} height={120} width={width - 40} style={{ backgroundColor: theme.colors.primary, borderRadius: 5, marginTop: 5 }} skeletonStyle={{ backgroundColor: theme.colors.secondary }}></Skeleton>}
                </View>
                <View style={{ marginTop: 15, marginHorizontal: 25 }}>
                  <Text style={styles.subjectLabel}>Statistics</Text>
                  {tickerData != null ?
                    <View style={{ flexDirection: 'row', marginTop: 5 }}>
                      <View style={{ flex: 0.7, gap: 10 }}>
                        <View>
                          <Text style={styles.statType}>Open</Text>
                          <Text style={styles.statData}>
                            ${tickerData.priceDetails.open}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.statType}>Today's High</Text>
                          <Text style={styles.statData}>
                            ${tickerData.priceDetails.high}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.statType}>Today's Low</Text>
                          <Text style={styles.statData}>
                            ${tickerData.priceDetails.low}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.statType}>Today's Volume</Text>
                          {tickerData.priceDetails && (
                            <Text style={styles.statData}>
                              {formatLargeNumber(tickerData.priceDetails.volume)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ gap: 10 }}>
                        <View>
                          <Text style={styles.statType}>Market Cap</Text>
                          {tickerData.detailsResponse.results.market_cap && (
                            <Text style={styles.statData}>
                              $
                              {formatLargeNumber(
                                tickerData.detailsResponse.results.market_cap,
                              )}
                            </Text>
                          )}
                        </View>
                        <View>
                          <Text style={styles.statType}>52 Wk High</Text>
                          <Text style={styles.statData}>-</Text>
                        </View>
                        <View>
                          <Text style={styles.statType}>52 Wk Low</Text>
                          <Text style={styles.statData}>-</Text>
                        </View>
                        <View>
                          <Text style={styles.statType}>Avg. Volume</Text>
                          <Text style={styles.statData}>-</Text>
                        </View>
                      </View>
                    </View> : <Skeleton animation={"pulse"} height={200} width={width - 40} style={{ backgroundColor: theme.colors.primary, borderRadius: 5, marginTop: 5 }} skeletonStyle={{ backgroundColor: theme.colors.secondary }}></Skeleton>}
                </View>
                <View style={{ marginTop: 20, paddingBottom: 130 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 20,
                    }}>
                    <Text style={[styles.subjectLabel, { marginLeft: 25 }]}>
                      News
                    </Text>
                    <View style={{ flex: 1 }}></View>
                    <TouchableOpacity
                      style={{ paddingVertical: 5, paddingLeft: 10 }}>
                      <Text style={styles.showMoreButtonText}>View More</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}>
                    {tickerData != null ?
                      <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        {tickerData.news.results
                          .slice(0, 3)
                          .map((item: any, index: any) => (
                            <View
                              key={index}
                              style={{ marginTop: 10, marginRight: 10 }}>
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
                      </View> : <View></View>}
                  </ScrollView>
                </View>
              </>
            </ScrollView>
          </View>


          {params?.inGame == true && (
            <View style={styles.TradeButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.tradeButton,
                  { backgroundColor: currentAccentColorValue },
                ]}
                onPress={() =>
                  navigation.navigate('StockOrder', {
                    currentPrice: currentStockPrice,
                    isBuying: true,
                    ticker: params?.ticker,
                    matchID: params?.matchID,
                    buyingPower: params?.buyingPower,
                    endAt: params?.endAt,
                    logoUrl: tickerData && tickerData.detailsResponse.results.branding != undefined
                      ? tickerData.detailsResponse.results.branding.icon_url +
                      '?apiKey=' +
                      polygonKey
                      : 'logoUrlError'
                  })
                }>
                <Text style={styles.tradeButtonText}>Buy</Text>
              </TouchableOpacity>
              {(owns == true || params?.owns == true) && (
                <TouchableOpacity
                  style={[
                    styles.tradeButton,
                    { backgroundColor: currentAccentColorValue },
                  ]}
                  onPress={() =>
                    navigation.navigate('StockOrder', {
                      currentPrice: currentStockPrice,
                      isSelling: true,
                      ticker: params?.ticker,
                      matchID: params?.matchID,
                      qty: params?.qty,
                      endAt: params?.endAt,
                    })
                  }>
                  <Text style={[styles.tradeButtonText]}>Sell</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={['50%']}
            index={-1}
            enablePanDownToClose
            onChange={handleSheetChanges}
            backgroundStyle={{
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.secondary,
              borderTopWidth: 1,
              borderRadius: 0,
            }}
            handleIndicatorStyle={{ backgroundColor: theme.colors.opposite }}>
            <BottomSheetView style={{ flex: 1 }}>
              <View style={styles.popup}>
                <View style={styles.popupContent}>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontFamily: 'InterTight-Black',
                      fontSize: 18,
                    }}>
                    Add {ticker} to a List
                  </Text>
                </View>
                <ScrollView style={{ width: width }}>
                  <CreateWatchlistButton />
                  <View style={{ marginHorizontal: 20 }}>
                    {watchLists.map((watchList: any, index) => {
                      return (
                        <WatchlistButton
                          key={index}
                          watchListName={watchList.watchListName}
                          watchListIcon={watchList.watchListIcon}
                          numberOfAssets={watchList.watchedStocks.length}
                          onAddToWatchListPage={true}
                          isSelected={queueToAdd.includes(
                            watchList.watchListName,
                          )}
                          onQueueChange={handleQueueChange}
                        />
                      );
                    })}
                  </View>
                </ScrollView>
                <TouchableOpacity
                  onPress={addToWatchlist}
                  style={{
                    marginBottom: 50,
                    backgroundColor: theme.colors.text,
                    width: width - 40,
                    height: 50,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 15,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'InterTight-Bold',
                      color: theme.colors.background,
                    }}>
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </BottomSheetView>
          </BottomSheet>
        </View>
      }
    </View>
  );
};

export default StockDetails;

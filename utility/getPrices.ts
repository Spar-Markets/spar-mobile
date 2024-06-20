import {GraphPoint} from 'react-native-graph';
import axios from 'axios';
import { serverUrl } from '../constants/global';

const getPrices = async (ticker: string, isOneDayData: boolean) => {
    try {
      interface TickerPricestamp {
        price: number;
        timeField: number;
      }
      console.log("getprices", ticker)
      const response = await axios.post(
        serverUrl + '/getMostRecentOneDayPrices',
        {ticker: String(ticker), isOneDayData: isOneDayData}
      )
      
     
        // Check if response is successful and has data
        //console.log("Response 1D", response.data["1D"])

        const formatData = (data:TickerPricestamp[]) => {
          const firstPrice = data[0].price
          const points = data.map((data, index) => ({
            value: data.price,
            normalizedValue: data.price - firstPrice,
            date: new Date(data.timeField).toString(),
            index: index
          }));

          return points 
        }

        if (response && response.data) {
         
          const timeframes = ["1D", "1W", "1M", "3M", "YTD", "1Y", "5Y"];

          const result:any = {}

          if (isOneDayData != true) {
            for (const timeframe of timeframes) {
              result[timeframe] = formatData(response.data[timeframe][ticker]);
            }
          } else {
              result["1D"] = formatData(response.data["1D"][ticker])
          }

         // return {"1D":oneDayFormattedData,"1W":oneWeekFormattedData, "1M":oneMonthFormattedData}
         
         return result

        }
      
    } catch (error) {
      console.error('getPrices error getting prices', error);
    }
  };

  export default getPrices
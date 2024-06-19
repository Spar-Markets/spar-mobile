import {GraphPoint} from 'react-native-graph';
import axios from 'axios';
import { serverUrl } from '../constants/global';

const getPrices = async (ticker: string) => {
    try {
      interface TickerPricestamp {
        price: number;
        timeField: number;
      }
      console.log("getprices", ticker)
      const response = await axios.post(
        serverUrl + '/getMostRecentOneDayPrices',
        {ticker: String(ticker)}
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
          const oneDayData: TickerPricestamp[] = response.data["1D"][ticker];
          const oneWeekData: TickerPricestamp[] = response.data["1W"][ticker];
          
          // Map the data to the format expected by the graphing library
          const oneDayFormattedData = formatData(oneDayData)
          const oneWeekFormattedData = formatData(oneWeekData)

          return {"1D":oneDayFormattedData,"1W":oneWeekFormattedData}

        }
      
    } catch (error) {
      console.error('getPrices error getting prices', error);
    }
  };

  export default getPrices
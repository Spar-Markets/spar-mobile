// TODO: implement it
import axios from 'axios'; // Corrected this line, do not destructure axios
import {polygonKey} from '../constants/global';

async function getCurrentPrice(ticker) {
  const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${polygonKey}`;
  const response = await axios.get(url);
  const currPrice = response.data.ticker.day.c;

  return currPrice;
}

export default getCurrentPrice;

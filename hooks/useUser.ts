import {useState, useEffect} from 'react';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import { useSelector } from 'react-redux';
import { RootState } from '../GlobalDataManagment/store';

interface UserData {
  __v: number;
  _id: string;
  activematches: any[];
  balance: Number
  createdAt: string;
  email: string;
  pastmatches: any[];
  plaidPersonalAccess: string;
  skillRating: Number
  userID: string;
  username: string;
  followers: [string],
  following: [string],
  outgoingFollowRequests: [string],
  incomingFollowRequests: [string]
  watchLists: [object]
}

/**
 * grabs user data from mongo
 * @param userID 
 * @returns 
 */
const useUserData = (userID?: string) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const userIsMade = useSelector((state: RootState) => state.user.isUserMade);

  useEffect(() => {
    if (userID && userIsMade) {
      const fetchUserData = async () => {
        try {
          //console.log("server url FROM env:", `${process.env.SERVER_URL}`);
          //console.log("Server url endpoint:", `${serverUrl}/getUser`);
          //console.log("USEUSER, UserID:", userID);
          console.log("PASSING USER ID IN TO GET USER ENDPOINT:", userID)
          console.log("SERVER URL", serverUrl)
          const response = await axios.post(`${serverUrl}/getUser`, { userID });
          //console.log('Fetched User Data:', response.data);
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userID]);

  return { userData, loading };
};

export default useUserData;

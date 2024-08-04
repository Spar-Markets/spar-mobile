import {useState, useEffect} from 'react';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import { useSelector, useDispatch} from 'react-redux';
import { RootState } from '../GlobalDataManagment/store';
import { setBalance, setDefaultProfileImage, setFriends, addFriend, removeFriend, setHasDefaultProfileImage, setInvitations, setSkillRating, setUserBio, setUsername, setFriendCount } from '../GlobalDataManagment/userSlice'

interface UserData {
  __v: number;
  _id: string;
  activematches: any[];
  balance: Number
  createdAt: string;
  email: string;
  bio: string;
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
 * @returns 
 */
const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const userID = useSelector((state: RootState) => state.user.userID);

  const dispatch = useDispatch()

  const [gotData, setGotData] = useState<boolean>(false)
  
  useEffect(() => {
    if (!gotData) {
      if (userID) {
        const fetchUserData = async () => {
          try {
            //console.log("server url FROM env:", `${process.env.SERVER_URL}`);
            //console.log("Server url endpoint:", `${serverUrl}/getUser`);
            //console.log("USEUSER, UserID:", userID);
            console.log("PASSING USER ID IN TO GET USER ENDPOINT:", userID)
            console.log("SERVER URL", serverUrl)
            const userResponse = await axios.post(`${serverUrl}/getUser`, { userID });
            const friendResponse = await axios.post(`${serverUrl}/getFriends`, { userID })
            //console.log('Fetched User Data:', response.data);
            dispatch(setUsername(userResponse.data.username))
            dispatch(setUserBio(userResponse.data.bio))
            dispatch(setSkillRating(userResponse.data.skillRating))
            dispatch(setBalance(userResponse.data.balance))
            // dispatch(setFollowers(response.data.followers))
            // dispatch(setFollowing(response.data.following))

            dispatch(setHasDefaultProfileImage(userResponse.data.hasDefaultProfileImage))
            dispatch(setDefaultProfileImage(userResponse.data.defaultProfileImage))
            dispatch(setInvitations(userResponse.data.invitations))
            dispatch(setFriendCount(userResponse.data.friendCount))

            dispatch(setFriends(friendResponse.data))

            setUserData(userResponse.data);
            setGotData(true)
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
    }
  }, [userID]);

  return { userData };
};

export default useUserData;

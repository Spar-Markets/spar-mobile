import axios from 'axios';
import { getDownloadURL, ref } from 'firebase/storage';
import storage from '@react-native-firebase/storage';
import { serverUrl } from '../constants/global';

const getProfileImage = async userID => {
  try {
    const response = await axios.get(`${serverUrl}/getProfileImages/${userID}`);
    const { hasDefaultProfileImage, defaultProfileImage } = response.data;
    const imageMap = [
      '',
      require('../assets/images/profile1.png'),
      require('../assets/images/profile2.png'),
      require('../assets/images/profile3.png'),
    ];

    if (hasDefaultProfileImage == true) {
      const tempURI = imageMap[Number(defaultProfileImage)];

      return { hasDefaultProfileImage: true, profileImage: tempURI };
    } else if (hasDefaultProfileImage == false) {
      const imageRef = storage().ref(`profileImages/${userID}`);
      try {
        const url = await imageRef.getDownloadURL();
        if (url) {
          return { hasDefaultProfileImage: false, profileImage: url };
        }
      } catch (error) {
        console.log('HELLA THINGS WRONG IF U GETTING HERE');
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export default getProfileImage;

import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import createProfileStyles from '../../styles/createProfileStyles';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase/firebase';
import { Skeleton } from '@rneui/base';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const UserCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createProfileStyles(theme, width);
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [noPic, setNoPic] = useState(false)

    const navigation = useNavigation<any>();
    
    useEffect(() => {
        const getProfileImage = async () => {
          const imageRef = ref(storage, `profileImages/${props.userID}`);
          try {
            const url = await getDownloadURL(imageRef);
            console.log(props.username, url);
            if (url) {
              setProfileImage(url);
              setNoPic(false);
            } else {
              setNoPic(true);
            }
          } catch (error) {
            console.log("Error fetching profile image: ", error);
            setNoPic(true);
          }
          setLoading(false);
        };
        getProfileImage();
      }, [props.userID, props.username]);
    
      useEffect(() => {
        if (profileImage || (noPic == true)) {
            setLoading(false)
        }
    }, [profileImage])

    const [imageLoading, setImageLoading] = useState(true)
    
    if (loading) {
        return (
          <View>
            
          </View>
        );
      }


    return (
        <TouchableOpacity style={{marginHorizontal: 20, flexDirection: 'row', height: 50, alignItems: 'center', gap: 20}} onPress={() => navigation.navigate("OtherProfile", {otherUserID: props.userID})}>
            {profileImage && <Image style={styles.userCardPic} onLoad={() => setImageLoading(false)} source={{uri: profileImage}}></Image>}
            {noPic == true && <View style={[styles.userCardPic, {backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.tertiary, justifyContent: 'center', alignItems: 'center'}]}>
                <Text style={{fontFamily: 'InterTight-Black', color: theme.colors.text}}>{props.username.slice(0,1)}</Text>
            </View>}
            {(!imageLoading || noPic) && <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 20}}>{props.username}</Text>}
        </TouchableOpacity>
    )
}

export default UserCard
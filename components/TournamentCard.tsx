import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const TournamentCard = (props: any) => {

  const screenWidth = Dimensions.get('window').width;
  // this function isn't working form what I can figure so this needs to be implemented and created/finished 
  const calculateTimeRemaining = (startDate: Date) => {
    const endDateTime = new Date(startDate).getTime();
    const currentTime = new Date().getTime();

    const timeRemaining = Math.max(0, endDateTime - currentTime); // Ensure time remaining doesn't go negative
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    // Format minutes with leading zero if necessary
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    // Format seconds with leading zero if necessary
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(props.startDate),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(props.startDate));
      if (timeRemaining == '0:0:0') {
        //fix format of time
        //run axios post to remove match from matches and distribute winnings. add to past matches collection
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [props.startDate]);

  return (
    <TouchableOpacity
      style={{
        marginBottom: 10,
        marginLeft: 15,
        width: 300,
        maxWidth: screenWidth - 30,
        borderRadius: 12,
        justifyContent: 'space-between',
      }}>
      <LinearGradient
        colors={['#272743', '#43436e']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={{
          flex: 1,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#3a3a61',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 15,
          }}>
          <Text
            style={{
              fontFamily: 'InterTight-Bold',
              fontSize: 22,
              color: '#fff',
            }}>
            {props.name}
          </Text>
          <View style={{flex: 1}}></View>
          <View style={{borderRadius: 6, backgroundColor: '#1ae79c'}}>
            <Text
              style={{
                padding: 5,
                fontFamily: 'InterTight-Bold',
                fontSize: 16,
                color: '#43436e',
              }}>
              ${props.entryFee}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 60,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}>
          <View style={{margin: 15}}>
            <Text
              style={{
                fontFamily: 'InterTight-Bold',
                fontSize: 12,
                color: '#fff',
              }}>
              Starting in
            </Text>
            <Text style={{fontFamily: 'InterTight-Bold', color: '#fff'}}>
              24 Minutes
            </Text>
          </View>
          <View style={{margin: 15}}>
            <Text
              style={{
                fontFamily: 'InterTight-Bold',
                fontSize: 12,
                color: '#fff',
              }}>
              Prize Pool
            </Text>
            <Text style={{fontFamily: 'InterTight-Bold', color: '#fff'}}>
              $1,040
            </Text>
          </View>
          <View style={{margin: 15}}>
            <Text
              style={{
                fontFamily: 'InterTight-Bold',
                fontSize: 12,
                color: '#fff',
              }}>
              Players
            </Text>
            <Text style={{fontFamily: 'InterTight-Bold', color: '#fff'}}>
              52
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const darkStyles = StyleSheet.create({
  txt: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'InterTight-Black',
  },
});

const lightStyles = StyleSheet.create({
  txt: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'InterTight-Black',
  },
});

export default TournamentCard;

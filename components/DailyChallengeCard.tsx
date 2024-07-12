import { Text, TouchableOpacity, View, } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const DailyChallengeCard = () => {
  
    return (
        <View>
            <TouchableOpacity style={{flexDirection: 'row', height: 150, width: 300}}>
                <LinearGradient colors={["#29292f", "#29292f"]} style={{borderRadius: 6, flex: 1}}>
                    <Text>Hello</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};


export default DailyChallengeCard;

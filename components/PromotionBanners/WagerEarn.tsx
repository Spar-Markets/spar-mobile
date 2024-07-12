import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import { Text, TouchableOpacity, View, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const WagerEarn = (props:any) => {

    const { width: screenWidth } = Dimensions.get('window');
  
    return (
        <View style={{ marginLeft: 15}}>
            <View style={{height: 120, width: screenWidth-30, borderRadius: 12}}>
                <LinearGradient colors={['#1ae79c', '#148f61']} style={{flex: 1, borderRadius: 12, justifyContent: 'center'}}>
                    <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20, alignItems: 'center'}}>
                        <View> 
                            <Text style={{color: '#fff', fontFamily: 'Intertight-black', fontSize: 32}}>$10 Bonus</Text>
                            <Text style={{color: '#ddd', fontFamily: 'Intertight-Black'}}>Wager $10, Get $10 in Bonus Cash</Text>
                            <Text style={{color: '#ddd', fontFamily: 'Intertight-Black'}}>Limited to 100 Users</Text>
                        </View>
                        <TouchableOpacity style={{backgroundColor: '#0f4d36', height: 60, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: 12}}>
                            <Text style={{color: '#fff', fontFamily: 'InterTight-Black', fontSize: 18}}>Redeem</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};


export default WagerEarn;

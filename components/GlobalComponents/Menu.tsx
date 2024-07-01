import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Menu = () => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createGlobalStyles(theme, width)

    const handleLogout = async () => {
        await signOut(auth)
        await AsyncStorage.removeItem('profileImgPath');
    }

    const navigation = useNavigation<any>();

    return (
        <View style={{flex: 1, justifyContent: 'center'}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{color: theme.colors.text}}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
            <Text style={{color: theme.colors.text}}>Log out</Text>
        </TouchableOpacity>
        </View>
    )
}

export default Menu

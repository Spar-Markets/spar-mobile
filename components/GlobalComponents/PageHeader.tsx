import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcons from 'react-native-vector-icons/Feather'

const PageHeader = (props:any) => {

    FeatherIcons.loadFont()

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createGlobalStyles(theme, width)

    const navigation = useNavigation<any>();

    return (
    <View style={styles.headerContainer}>
        {props.canGoBack != false && <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <FeatherIcons name="arrow-left" style={{color: theme.colors.opposite}} size={20}/>
            <Text style={styles.headerText}>{props.text}</Text>
            <View style={{flex: 1}}></View>
            {props.onProfile == true &&
            <View style={{marginRight: 10, flexDirection: 'row'}}>
                <TouchableOpacity style={{paddingHorizontal: 10}} onPress={() => navigation.navigate("ProfileSearch")}>
                    <Icon name={"search"} size={20} color={theme.colors.opposite} />
                </TouchableOpacity>
                <TouchableOpacity style={{paddingHorizontal: 10}} onPress={() => navigation.navigate("ProfileActivity")}>
                    <Icon name={"heart"} size={20} color={theme.colors.opposite}></Icon>
                    <View style={{position: 'absolute', right:5, top:-2, height: 12, width: 12, backgroundColor: 'red', borderRadius: 100, borderWidth: 2, borderColor: theme.colors.background}}></View>
                </TouchableOpacity>
            </View>
            
            }
        </TouchableOpacity>}
    </View>
    )
}

export default PageHeader;
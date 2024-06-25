import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';

const HeadToHeadEntry = () => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width)

    //for dropdown
    const [isFocus, setIsFocus] = useState(false);
    const [isFocus2, setIsFocus2] = useState(false);
    const [isFocus3, setIsFocus3] = useState(false);
    const [value, setValue] = useState('$11');
    const [value2, setValue2] = useState('15min');
    const [value3, setValue3] = useState('Stock');

    const entryFeeData = [
        {label: '$5.50', value: '5.5'},
        {label: '$11', value: '11'},
        {label: '$27.5', value: '27.5'},
        {label: '$55', value: '55'},
        {label: '$110', value: '110'},
        {label: '$275', value: '275'},
    ];

    const timeFrameData = [
        {label: '5m', value: '300'},
        {label: '15m', value: '900'},
        {label: '30m', value: '1800'},
        {label: '1hr', value: '3600'},
        {label: '1d', value: '23400'},
        {label: '1w', value: '117000'},
    ];

    const typeData = [
        {label: 'Stock', value: 'stock'},
        {label: 'Options', value: 'options'},
        {label: 'Crypto', value: 'crypto'},
    ];

    return (
        <View style={styles.hthContainer}>
          <View style={{flex: 1}}>
            <View style={styles.dropdownCollection}>
                <Text style={{color: theme.colors.text, fontWeight: 'bold', fontSize: 16}}>Entry Fee</Text>
                <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: theme.colors.accent },
              
                ]} // Apply when specific value is selected
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={entryFeeData}
                containerStyle = {styles.itemsContainer}
                dropdownPosition = 'top'
                showsVerticalScrollIndicator = {false}
                iconStyle={styles.iconStyle}
                maxHeight={300}
                labelField="label"
                valueField="value"
                autoScroll = {false}
                itemTextStyle = {styles.dropdownText}
                activeColor = {theme.colors.tertiary}
                placeholder={!isFocus ? '$11' : value}
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                }} 
                />
            </View>
            <View style={styles.dropdownCollection}>
                <Text style={{color: theme.colors.text, fontWeight: 'bold', fontSize: 16}}>Time Frame</Text>
                <Dropdown
                style={[styles.dropdown, isFocus2 && { borderColor: theme.colors.accent },
                ]} // Apply when specific value is selected
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={timeFrameData}
                containerStyle = {styles.itemsContainer}
                dropdownPosition = 'top'
                showsVerticalScrollIndicator = {false}
                iconStyle={styles.iconStyle}
                maxHeight={300}
                labelField="label"
                valueField="value"
                autoScroll = {false}
                itemTextStyle = {styles.dropdownText}
                activeColor = {theme.colors.tertiary}
                placeholder={!isFocus2 ? '5m' : value2}
                value={value2}
                onFocus={() => setIsFocus2(true)}
                onBlur={() => setIsFocus2(false)}
                onChange={item => {
                    setValue2(item.value);
                    setIsFocus2(false);
                }} 
                />
            </View>
            <View style={styles.dropdownCollection}>
                <Text style={{color: theme.colors.text, fontWeight: 'bold', fontSize: 16}}>Type</Text>
                <Dropdown
                style={[styles.dropdown, isFocus3 && { borderColor: theme.colors.accent },
                ]} // Apply when specific value is selected
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={typeData}
                containerStyle = {styles.itemsContainer}
                dropdownPosition = 'top'
                showsVerticalScrollIndicator = {false}
                iconStyle={styles.iconStyle}
                maxHeight={300}
                labelField="label"
                valueField="value"
                autoScroll = {false}
                itemTextStyle = {styles.dropdownText}
                activeColor = {theme.colors.tertiary}
                placeholder={!isFocus3 ? 'Stock' : value3}
                value={value3}
                onFocus={() => setIsFocus3(true)}
                onBlur={() => setIsFocus3(false)}
                onChange={item => {
                    setValue3(item.value);
                    setIsFocus3(false);
                }} 
                />
            </View>
          </View>
          <TouchableOpacity style={styles.enterButton}>
            
          </TouchableOpacity>
        </View>
    )
}

export default HeadToHeadEntry;
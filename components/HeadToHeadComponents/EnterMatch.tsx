import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHTHStyles from '../../styles/createHTHStyles';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import PageHeader from '../GlobalComponents/PageHeader';
import { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const EnterMatch = () => {
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createHTHStyles(theme, width);
    const globalStyles = createGlobalStyles(theme, width);
    const navigation = useNavigation();

    const [isEfFocus, setIsEfFocus] = useState(false);
    const [isTfFocus, setIsTfFocus] = useState(false);
    const [isSFocus, setIsSFocus] = useState(false);
    const [efValue, setEfValue] = useState('11');
    const [tfValue, setTfValue] = useState('15m');
    const [sValue, setSValue] = useState('Stock');
    const [activeAccent, setActiveAccent] = useState(theme.colors.stockUpAccent);

    const prizePool = parseFloat(efValue.replace('$', '')) * 2;
    const prize = prizePool - prizePool / 11;

    const ruleMessage = (title:string, message:string) => (
        <View>
            <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>{title}</Text>
            <Text style={{ color: theme.colors.secondaryText }}>{message}</Text>
        </View>
    );

    useEffect(() => {
        if (sValue === "stock") {
            setActiveAccent(theme.colors.stockUpAccent);
        } else if (sValue === "options") {
            setActiveAccent(theme.colors.optionsUpAccent);
        } else if (sValue === "crypto") {
            setActiveAccent(theme.colors.cryptoUpAccent);
        }
    }, [sValue]);

    const entryFeeData = [
        { label: '$5.50', value: '5.50' },
        { label: '$11', value: '11' },
        { label: '$27.5', value: '27.50' },
        { label: '$55', value: '55' },
        { label: '$110', value: '110' },
        { label: '$275', value: '275' },
    ];

    const timeFrameData = [
        { label: '5m', value: '300' },
        { label: '15m', value: '900' },
        { label: '30m', value: '1800' },
        { label: '1hr', value: '3600' },
        { label: '1d', value: '23400' },
        { label: '1w', value: '117000' },
    ];

    const typeData = [
        { label: 'Stock', value: 'stock' },
        { label: 'Options', value: 'options' },
        { label: 'Crypto', value: 'crypto' },
    ];

    return (
            <View style={styles.container}>
                <PageHeader text="Matchmaking"/>
                <ScrollView style={{marginHorizontal: 20}}>
                    <View style={styles.matchParamsContainer}>
                        <View>
                            <View style={styles.labelTextContainer}>
                                <Text style={styles.labelText}>Entry Fee</Text>
                            </View>
                            <View style={styles.labelTextContainer}>
                                <Text style={styles.labelText}>Time Frame</Text>
                            </View>
                            <View style={styles.labelTextContainer}>
                                <Text style={styles.labelText}>Type</Text>
                            </View>
                            <View style={styles.labelTextContainer}>
                                <Text style={styles.labelText}>Prize</Text>
                            </View>
                            <View style={styles.labelTextContainer}>
                                <Text style={styles.labelText}>Players Matchmaking</Text>
                            </View>
                        </View>
                        <View></View>
                        <View style={{ flex: 1 }}>
                            <View style={styles.dropdownCollection}>
                                <Dropdown
                                    style={[styles.dropdown, isEfFocus && { borderColor: activeAccent }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={entryFeeData}
                                    containerStyle={styles.itemsContainer}
                                    dropdownPosition='bottom'
                                    showsVerticalScrollIndicator={false}
                                    iconStyle={styles.iconStyle}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    autoScroll={false}
                                    itemTextStyle={styles.dropdownText}
                                    activeColor={theme.colors.tertiary}
                                    placeholder={!isEfFocus ? '11' : `$${efValue}`}
                                    value={efValue}
                                    onFocus={() => setIsEfFocus(true)}
                                    onBlur={() => setIsEfFocus(false)}
                                    onChange={item => {
                                        setEfValue(item.value);
                                        setIsEfFocus(false);
                                    }}
                                />
                            </View>
                            <View style={styles.dropdownCollection}>
                                <Dropdown
                                    style={[styles.dropdown, isTfFocus && { borderColor: activeAccent }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={timeFrameData}
                                    containerStyle={styles.itemsContainer}
                                    dropdownPosition='bottom'
                                    showsVerticalScrollIndicator={false}
                                    iconStyle={styles.iconStyle}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    autoScroll={false}
                                    itemTextStyle={styles.dropdownText}
                                    activeColor={theme.colors.tertiary}
                                    placeholder={!isTfFocus ? '15m' : tfValue}
                                    value={tfValue}
                                    onFocus={() => setIsTfFocus(true)}
                                    onBlur={() => setIsTfFocus(false)}
                                    onChange={item => {
                                        setTfValue(item.value);
                                        setIsTfFocus(false);
                                    }}
                                />
                            </View>
                            <View style={styles.dropdownCollection}>
                                <Dropdown
                                    style={[styles.dropdown, isSFocus && { borderColor: activeAccent }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={typeData}
                                    containerStyle={styles.itemsContainer}
                                    dropdownPosition='bottom'
                                    showsVerticalScrollIndicator={false}
                                    iconStyle={styles.iconStyle}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    autoScroll={false}
                                    itemTextStyle={styles.dropdownText}
                                    activeColor={theme.colors.tertiary}
                                    placeholder={!isSFocus ? 'Stock' : sValue}
                                    value={sValue}
                                    onFocus={() => setIsSFocus(true)}
                                    onBlur={() => setIsSFocus(false)}
                                    onChange={item => {
                                        setIsSFocus(false);
                                        setSValue(item.value);
                                    }}
                                />
                            </View>
                            <View style={styles.enterMatchTextContainer}>
                                <Text style={[styles.enterMatchText, { color: activeAccent }]}>${prize}</Text>
                            </View>
                            <View style={styles.enterMatchTextContainer}>
                                <Text style={[styles.enterMatchText, { color: theme.colors.text }]}>454</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 20, gap: 10 }}>
                        {ruleMessage("Match Rules", "With $100,000 in simulated buying power, trade stocks and achieve a greater return than your opponent to win.")}
                        {ruleMessage("Prize", "The prize pool is the sum of the entry fees minus 10% that goes to us so we can improve our platform and offer free-to-play tournaments.")}
                        {ruleMessage("Matchmaking", `If you aren’t matched up or you cancel matchmaking before a match begins, your $${efValue} will be credited back to your account.`)}
                    </View>
                    <View style={{ flex: 1 }}></View>
                </ScrollView>
                <TouchableOpacity style={[globalStyles.primaryBtn, { marginBottom: 50, backgroundColor: activeAccent }]}>
                    <Text style={globalStyles.primaryBtnText}>Enter Matchmaking (${efValue})</Text>
                </TouchableOpacity>
            </View>
    );
};

export default EnterMatch;

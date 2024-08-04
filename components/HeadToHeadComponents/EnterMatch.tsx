import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHTHStyles from '../../styles/createHTHStyles';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import PageHeader from '../GlobalComponents/PageHeader';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { serverUrl } from '../../constants/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setIsInMatchmaking } from '../../GlobalDataManagment/userSlice';
import { RootState } from '../../GlobalDataManagment/store';

const EnterMatch = () => {
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createHTHStyles(theme, width);
    const globalStyles = createGlobalStyles(theme, width);
    const navigation = useNavigation();

    const [isEntryFeeFocus, setIsEntryFeeFocus] = useState(false);
    const [isTimeframeFocus, setIsTimeframeFocus] = useState(false);
    const [isTypeFocus, setIsTypeFocus] = useState(false);
    const [entryFeeValue, setEntryFeeValue] = useState('11');
    const [timeframeValue, setTimeframeValue] = useState('15m');
    const [typeValue, setTypeValue] = useState('Stock');
    const [activeAccent, setActiveAccent] = useState(theme.colors.stockUpAccent);

    const user = useSelector((state: RootState) => state.user);

    const prizePool = parseFloat(entryFeeValue.replace('$', '')) * 2;
    const prize = prizePool - prizePool / 11;

    const dispatch = useDispatch();

    //rules to display
    const ruleMessage = (title: string, message: string) => (
        <View>
            <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>{title}</Text>
            <Text style={{ color: theme.colors.secondaryText }}>{message}</Text>
        </View>
    );

    // 
    const handleEnterMatchmaking = async (entryFee: String, matchLength: String, matchType: String) => {
        //Ensure valid game params before starting search
        if (entryFee == 'Entry Fee' || matchLength == 'Match Length') {
            Alert.alert('Not Valid Match Params');
            return;
        }
        //retrieve user's skill rating

        console.log(entryFee);
        console.log(matchLength);
        console.log(matchType);

        const userID = await AsyncStorage.getItem('userID');
        console.log('userID:', userID);

        //Asign current user's values to a player object
        const player = {
            username: user.username,
            userID: userID,
            skillRating: user.skillRating,
            entryFee: entryFee,
            matchLength: matchLength,
            matchType: matchType
        };
        //Pass the players object to the database
        console.log('Log' + player);
        try {
            const response = await axios.post(
                serverUrl + '/userToMatchmaking',
                player,
            );
            console.log(response);
        } catch (error) {
            console.log('EnterMatch.tsx error in handleEnterMatchmaking:', error);
        }
        dispatch(setIsInMatchmaking(true));
        navigation.goBack();
    };

    useEffect(() => {
        if (typeValue === "stock") {
            setActiveAccent(theme.colors.stockUpAccent);
        } else if (typeValue === "options") {
            setActiveAccent(theme.colors.optionsUpAccent);
        } else if (typeValue === "crypto") {
            setActiveAccent(theme.colors.cryptoUpAccent);
        }
    }, [typeValue]);

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
            <PageHeader text="Matchmaking" />
            <ScrollView style={{ marginHorizontal: 20 }}>
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
                                style={[styles.dropdown, isEntryFeeFocus && { borderColor: activeAccent }]}
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
                                placeholder={!isEntryFeeFocus ? '11' : `$${entryFeeValue}`}
                                value={entryFeeValue}
                                onFocus={() => setIsEntryFeeFocus(true)}
                                onBlur={() => setIsEntryFeeFocus(false)}
                                onChange={item => {
                                    setEntryFeeValue(item.value);
                                    setIsEntryFeeFocus(false);
                                }}
                            />
                        </View>
                        <View style={styles.dropdownCollection}>
                            <Dropdown
                                style={[styles.dropdown, isTimeframeFocus && { borderColor: activeAccent }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                data={timeFrameData}
                                containerStyle={styles.itemsContainer}
                                itemContainerStyle={styles.item}
                                dropdownPosition='bottom'
                                showsVerticalScrollIndicator={false}
                                iconStyle={styles.iconStyle}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                autoScroll={false}
                                itemTextStyle={styles.dropdownText}
                                activeColor={theme.colors.tertiary}
                                placeholder={!isTimeframeFocus ? '15m' : timeframeValue}
                                value={timeframeValue}
                                onFocus={() => setIsTimeframeFocus(true)}
                                onBlur={() => setIsTimeframeFocus(false)}
                                onChange={item => {
                                    setTimeframeValue(item.value);
                                    setIsTimeframeFocus(false);
                                }}
                            />
                        </View>
                        <View style={styles.dropdownCollection}>
                            <Dropdown
                                style={[styles.dropdown, isTypeFocus && { borderColor: activeAccent }]}
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
                                placeholder={!isTypeFocus ? 'Stock' : typeValue}
                                value={typeValue}
                                onFocus={() => setIsTypeFocus(true)}
                                onBlur={() => setIsTypeFocus(false)}
                                onChange={item => {
                                    setIsTypeFocus(false);
                                    setTypeValue(item.value);
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
                    {ruleMessage("Matchmaking", `If you aren’t matched up or you cancel matchmaking before a match begins, your $${entryFeeValue} will be credited back to your account.`)}
                </View>
                <View style={{ flex: 1 }}></View>
            </ScrollView>
            <TouchableOpacity onPress={() => handleEnterMatchmaking(entryFeeValue, timeframeValue, typeValue)} style={[globalStyles.primaryBtn, { marginBottom: 50, backgroundColor: activeAccent }]}>
                <Text style={globalStyles.primaryBtnText}>Enter Matchmaking (${entryFeeValue})</Text>
            </TouchableOpacity>
        </View>
    );
};

export default EnterMatch;

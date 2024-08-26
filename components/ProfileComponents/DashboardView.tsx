import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';

const DashboardView = () => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width);

    const user = useSelector((state: RootState) => state.user)

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, width: width }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1, padding: 10, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.tertiary, backgroundColor: theme.colors.secondary, marginLeft: 10, marginTop: 12 }}>
                    <View
                        style={{

                            borderRadius: 10,
                            flex: 1,
                        }}>
                        <Text
                            style={{
                                fontFamily: 'InterTight-Bold',
                                color: theme.colors.accent,
                            }}>
                            Balance
                        </Text>
                        <Text
                            style={{
                                fontFamily: 'InterTight-Bold',
                                fontSize: 20,
                                color: theme.colors.text,
                            }}>
                            ${user.balance?.toFixed(2)}
                        </Text>
                    </View>
                </View>

                <View style={{ flex: 1, padding: 10, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.tertiary, backgroundColor: theme.colors.secondary, marginRight: 10, marginTop: 12 }}>
                    <View
                        style={{

                            borderRadius: 10,
                            flex: 1,
                        }}>
                        <Text
                            style={{
                                fontFamily: 'InterTight-Bold',
                                color: theme.colors.accent,
                            }}>
                            Rating
                        </Text>
                        <Text
                            style={{
                                fontFamily: 'InterTight-Bold',
                                fontSize: 20,
                                color: theme.colors.text,
                            }}>
                            895 (Gold II)
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{ marginHorizontal: 10, backgroundColor: theme.colors.secondary, borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 10, marginTop: 10, padding: 10 }}>
                <View style={{ backgroundColor: theme.colors.secondary, padding: 4, borderRadius: 50, borderWidth: 2, borderColor: "#ffbf00", justifyContent: 'center' }}>
                    <View style={{ backgroundColor: "#ffbf00", width: '80%', height: 14, borderRadius: 50 }}></View>
                </View>
                <View style={{ flexDirection: 'row', marginHorizontal: 2, marginTop: 3 }}>
                    <Text style={{ color: theme.colors.text, fontFamily: 'Intertight-bold' }}>Gold II</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={{ color: theme.colors.text, fontFamily: 'Intertight-bold' }}>Gold III</Text>
                </View>
            </View>

            <View style={{ marginHorizontal: 10, backgroundColor: theme.colors.secondary, borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 10, marginTop: 10, padding: 10 }}>
                <View style={{ backgroundColor: theme.colors.secondary, padding: 4, borderRadius: 50, borderWidth: 2, borderColor: theme.colors.accent, justifyContent: 'center' }}>
                    <View style={{ backgroundColor: theme.colors.accent, width: '50%', height: 14, borderRadius: 50 }}></View>
                </View>
                <View style={{ flexDirection: 'row', marginHorizontal: 2, marginTop: 3 }}>
                    <Text style={{ color: theme.colors.text, fontFamily: 'Intertight-semibold' }}>4350 XP <Text style={{ color: theme.colors.text }}>until Lvl. 87</Text></Text>
                    <View style={{ flex: 1 }} />
                    <Text style={{ color: theme.colors.text, fontFamily: 'Intertight-semibold' }}>8700 XP</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, marginHorizontal: 10 }}>
                <View style={{ padding: 10, flex: 1, aspectRatio: 1.2, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, }}>Lifetime Wins</Text>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, fontSize: 30 }}>33</Text>
                </View>
                <View style={{ padding: 10, flex: 1, aspectRatio: 1.2, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, }}>Best Trade</Text>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, fontSize: 30 }}>+57%</Text>
                </View>
                <View style={{ padding: 10, flex: 1, aspectRatio: 1.2, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, }}>Win Streak</Text>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, fontSize: 30 }}>6🔥</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, marginHorizontal: 10 }}>
                <View style={{ padding: 10, flex: 1, aspectRatio: 1.2, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, textAlign: 'center' }}>Ranking Among Friends</Text>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, fontSize: 30 }}>#3</Text>
                </View>
                <View style={{ padding: 10, flex: 1, aspectRatio: 1.2, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, }}>Most Traded</Text>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, fontSize: 30 }}>AAPL</Text>
                </View>
                <View style={{ padding: 10, flex: 1, aspectRatio: 1.2, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.tertiary, borderWidth: 2, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, }}>Win Rate</Text>
                    <Text style={{ fontFamily: 'Intertight-bold', color: theme.colors.text, fontSize: 30 }}>72%</Text>
                </View>
            </View>


        </ScrollView>
    )
}

export default DashboardView
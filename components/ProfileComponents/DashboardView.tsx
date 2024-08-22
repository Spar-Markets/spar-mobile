import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';

const DashboardView = () => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createFeedStyles(theme, width);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, width: width }}>
            <View style={{ padding: 10, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.tertiary, backgroundColor: theme.colors.secondary, marginHorizontal: 10, marginTop: 12 }}>
                <View style={{ backgroundColor: theme.colors.secondary, padding: 1, borderRadius: 50, borderWidth: 2, borderColor: theme.colors.tertiary, justifyContent: 'center' }}>
                    <View style={{ backgroundColor: theme.colors.accent, width: '50%', height: 20, borderRadius: 50 }}></View>
                </View>
                <View style={{ flexDirection: 'row', marginHorizontal: 2, marginTop: 3 }}>
                    <Text style={{ color: theme.colors.accent, }}>4350 xp <Text style={{ color: theme.colors.text }}>until Lvl. 87</Text></Text>
                    <View style={{ flex: 1 }} />
                    <Text style={{ color: theme.colors.accent }}>8700 XP</Text>
                </View>
            </View>
        </ScrollView>
    )
}

export default DashboardView
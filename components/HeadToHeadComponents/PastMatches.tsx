import { View, Text } from 'react-native'
import React from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHTHStyles from '../../styles/createHTHStyles';
import PageHeader from '../GlobalComponents/PageHeader';

const PastMatches = () => {
    
    const navigation = useNavigation<any>();
    const route = useRoute();
  
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createHTHStyles(theme, width);


    return (
        <View style={styles.container}>
            <PageHeader text=""/>
        </View>
    )
}

export default PastMatches
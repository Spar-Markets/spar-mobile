import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Skeleton } from '@rneui/base'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';

const GameCardSkeleton = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width);

    return (
    <View style={[styles.gameCardContainer, {paddingHorizontal: 20}]}>
        <View style={{flexDirection: 'row', gap: 10}}>
        <Skeleton animation={"pulse"} height={20} width={30} style={{ backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.secondary}}></Skeleton>
        <Skeleton animation={"pulse"} height={20} width={80} style={{backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.secondary}}></Skeleton>
        <View style={{flex: 1}}></View>
        <Skeleton animation={"pulse"} height={20} width={60} style={{ backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.secondary}}></Skeleton>
        </View>
        <View style={{gap: 10, marginTop: 5, flex: 1}}>
            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                <Skeleton animation={"pulse"} height={20} width={130} style={{marginTop: 5, backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.secondary}}></Skeleton>
            </View>
            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                <Skeleton animation={"pulse"} height={20} width={130} style={{backgroundColor: theme.colors.primary, borderRadius: 5}} skeletonStyle={{backgroundColor: theme.colors.secondary}}></Skeleton>
            </View>
            <Skeleton animation={"pulse"} height={135} style={{backgroundColor: theme.colors.primary, borderRadius: 5, marginBottom: 13}} skeletonStyle={{backgroundColor: theme.colors.secondary}}></Skeleton>  
        </View> 
    </View>
    )
}

export default GameCardSkeleton


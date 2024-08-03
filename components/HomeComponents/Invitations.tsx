import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, FlatList, Image } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import { RootState } from '../../GlobalDataManagment/store';
import { useSelector } from 'react-redux';
import getProfileImage from '../../utility/getProfileImage';
import HTHInvitationItem from './HTHInvitationItem';

interface Invitation {
    invitationID: string;
    challengerUserID: string;
    createdAt: number;
    mode: string;
    timeframe: number;
    type: string;
    wager: number;
  }

const Invitations= () => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width)

    const user = useSelector((state: RootState) => state.user)
    const invitations = user.invitations

    const invitationArray = invitations && Object.keys(invitations).length > 0
        ? Object.entries(invitations).map(([invitationID, invitationData]) => ({
            invitationID,
            ...invitationData as Object
        }))
        : null;
    
    useEffect(() => {
        console.log(invitations)
    }, [])
    
    return (
    <View style={styles.container}>
        <PageHeader text="Invitations" />
        <View style={{flex: 1, marginHorizontal: 20}}>
            {invitationArray != null &&
            <FlatList
                data={invitationArray as Array<Invitation>}
                keyExtractor={(item) => item.invitationID}
                renderItem={({ item }) => <HTHInvitationItem item={item}/>}
                style={{paddingTop: 10}}
            />
            }
        </View>
    </View>
    )
}

export default Invitations;
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcons from 'react-native-vector-icons/Feather';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PageHeader = (props: any) => {
  MaterialCommunityIcons.loadFont();

  // Layour and Style Initilization
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createGlobalStyles(theme, width);

  const navigation = useNavigation<any>();

  return (
    <View style={styles.headerContainer}>
      {props.canGoBack != false && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackBtn}>
          <FeatherIcons
            name="arrow-left"
            style={{ color: theme.colors.opposite }}
            size={24}
          />
          {props.imageUri &&
            <>
              {props.hasDefaultImage == true && (
                <Image
                  style={[
                    { width: 30, height: 30, borderRadius: 100 },
                  ]}
                  source={props.imageUri as any}
                />
              )}
              {props.hasDefaultImage == false && (
                <Image
                  style={[
                    { width: 30, height: 30, borderRadius: 100 },
                  ]}
                  source={{ uri: props.imageUri } as any}
                />
              )}
            </>
          }
          <Text style={styles.headerText}>{props.text}</Text>
        </TouchableOpacity>
      )}

      <View style={{ flex: 1 }} />

      {props.onDm &&
        <TouchableOpacity
          style={{
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.secondary,
            borderWidth: 2,
            borderColor: theme.colors.tertiary,
            marginRight: 15,
            flexDirection: 'row',
            gap: 3,
            padding: 5
          }}
        >
          <Text style={{ color: theme.colors.opposite, fontFamily: 'intertight-bold', paddingLeft: 5 }}>Challenge</Text>
          <View style={{ backgroundColor: theme.colors.accent2, padding: 5, borderRadius: 50, borderColor: theme.colors.tertiary, borderWidth: 1 }}>
            <MaterialCommunityIcons name={"sword-cross"} color={theme.colors.opposite} size={18} />
          </View>
        </TouchableOpacity>
      }

      {props.onProfile == true && (
        <View
          style={{
            marginRight: 10,
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{ paddingHorizontal: 10 }}
            onPress={() => navigation.navigate('ProfileSearch')}>
            <Icon name={'search'} size={20} color={theme.colors.opposite} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingHorizontal: 10 }}
            onPress={() => navigation.navigate('ProfileActivity')}>
            <Icon name={'heart'} size={20} color={theme.colors.opposite}></Icon>
            <View
              style={{
                position: 'absolute',
                right: 5,
                top: -2,
                height: 12,
                width: 12,
                backgroundColor: 'red',
                borderRadius: 100,
                borderWidth: 2,
                borderColor: theme.colors.background,
              }}></View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PageHeader;

import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import StockSearch from './components/StockComponents/StockSearch';
import Profile from './components/ProfileComponents/Profile';
import Home from './components/HomeComponents/Home';
import Bank from './components/Bank';
import Feed from './components/FeedComponents/Feed';
import { useTheme } from './components/ContextComponents/ThemeContext';
import { useDimensions } from './components/ContextComponents/DimensionsContext';
import { useSelector } from 'react-redux';
import { RootState } from './GlobalDataManagment/store';

const Tab = createBottomTabNavigator();

const CoreApp = (): React.ReactElement => {
  const { theme } = useTheme();
  const { width } = useDimensions();
  const balance = useSelector((state: RootState) => state.user.balance);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';

            if (route.name === 'Portfolio') {
              iconName = 'home';
            } else if (route.name === 'Discover') {
              iconName = 'search';
            } else if (route.name === 'Bank') {
              iconName = 'bank';
            } else if (route.name === 'Profile') {
              iconName = 'user';
            } else if (route.name === 'Feed') {
              iconName = 'th-large';
            }

            return (
              <>
                <View style={{ flex: 1, alignItems: 'center', gap: 3, marginTop: 20 }}>
                  {route.name != "Portfolio" ? <Icon name={iconName} size={size} color={color} /> : <View style={{ height: size }}><Text style={[focused ? { color: theme.colors.text } : { color: theme.colors.secondaryText }, { fontFamily: 'InterTight-Bold', fontSize: 22 }]}>${balance?.toFixed(2)}</Text></View>}
                  <Text style={[focused ? { color: theme.colors.text } : { color: theme.colors.secondaryText }, { fontSize: 12, fontFamily: 'InterTight-medium' }]}>{route.name}</Text>
                  <View style={[focused ? { backgroundColor: theme.colors.accent } : { backgroundColor: 'transparent' }, { height: 3, width: width / 16, borderRadius: 100 }]}></View>
                </View>
              </>
            )
          },
          tabBarActiveTintColor: theme.colors.text,
          tabBarInactiveTintColor: theme.colors.secondaryText,
          tabBarStyle: {
            height: 85,
            borderRadius: 0,
            paddingHorizontal: 10,
            backgroundColor: theme.colors.background,
            marginBottom: 5,
            zIndex: 1,
          },
          tabBarShowLabel: false,
        })}
      >
        <Tab.Screen name="Discover" component={StockSearch} options={{ headerShown: false, lazy: false }} />
        <Tab.Screen name="Feed" component={Feed} options={{ headerShown: false }} />
        <Tab.Screen name="Portfolio" component={Home} options={{ headerShown: false, lazy: false }} />
        <Tab.Screen name="Bank" component={Bank} options={{ headerShown: false, lazy: false }} />
        <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false, lazy: false }} />
      </Tab.Navigator>
    </View>
  );
};

export default CoreApp;

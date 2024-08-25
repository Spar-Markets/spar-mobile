import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { TabView } from '@rneui/base';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createProfileStyles from '../../styles/createProfileStyles';
import Feed from '../FeedComponents/Feed';
import Post from '../FeedComponents/Post';


const ProfileTabView: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createProfileStyles(theme, width);

    const indicatorWidth = width / 3; // Adjust based on button width

    const handleIndexChange = (index: number) => {
        setSelectedIndex(index);
        Animated.spring(scrollX, {
            toValue: index * indicatorWidth,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ width: '100%' }}>
                <View style={styles.buttonRow}>
                    {['Posts', 'Liked', 'Missions'].map((label, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleIndexChange(index)}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            width: indicatorWidth,
                            transform: [{
                                translateX: scrollX,
                            }],
                        },
                    ]}
                />
            </View>
            <TabView
                value={selectedIndex}
                onChange={handleIndexChange}
                minSwipeSpeed={0.2}
                minSwipeRatio={0.4}
            >
                <TabView.Item style={{ width: '100%' }}>
                    <ScrollView style={styles.scene}>

                    </ScrollView>
                </TabView.Item>
                <TabView.Item style={{ width: '100%' }}>
                    <ScrollView style={styles.scene}>
                        <Text style={{ color: 'white' }}>Liked Views</Text>
                    </ScrollView>
                </TabView.Item>
                <TabView.Item style={{ width: '100%' }}>
                    <ScrollView style={styles.scene}>
                        <Text style={{ color: 'white' }}>Lists View</Text>
                    </ScrollView>
                </TabView.Item>
            </TabView>
        </View>
    );
};

export default ProfileTabView;

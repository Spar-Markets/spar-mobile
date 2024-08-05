import { FC, useCallback } from "react";
import { Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { FlatList } from "react-native";
import { useTheme } from "../ContextComponents/ThemeContext";
import { useDimensions } from "../ContextComponents/DimensionsContext";
import createStockSearchStyles from "../../styles/createStockStyles";
import { View } from "react-native";

interface TimeButtonsProps {
    timeFrameSelected: string;
    setTimeFrame: (timeFrame: string) => void;
    allPointData: Record<string, any> | null;
    currentAccentColorValue: string;
    setPointData: (data: any) => void
}

const TimeButtons: FC<TimeButtonsProps> = ({ timeFrameSelected, setTimeFrame, allPointData, setPointData, currentAccentColorValue }) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createStockSearchStyles(theme, width);

    const handlePress = useCallback((timeFrame: string) => {
        if (allPointData) {
            setTimeFrame(timeFrame);
            setPointData(allPointData[timeFrame])
        }
    }, [allPointData, setTimeFrame]);

    return (
        <View style={styles.timeCardContainer}>
            <FlatList
                horizontal
                data={['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'MAX']}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handlePress(item)}
                        style={
                            timeFrameSelected === item
                                ? [styles.timeButtonSelectedContainer, { borderColor: currentAccentColorValue }]
                                : styles.timeButtonContainer
                        }
                    >
                        <View
                            style={{
                                height: 2,
                                width: '100%',
                                backgroundColor: timeFrameSelected === item ? currentAccentColorValue : 'transparent',
                            }}
                        />
                        <Text style={timeFrameSelected === item ? styles.timeButtonSelectedText : styles.timeButtonText}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                style={{ paddingLeft: 20 }}
            />
        </View>
    );
};

export default TimeButtons;
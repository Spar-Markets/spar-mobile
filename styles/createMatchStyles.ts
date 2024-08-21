import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';
import { FontWeight } from '@shopify/react-native-skia';


const createMatchStyles = (theme: any, width: number) => {

    const statusBarHeight = useStatusBarHeight();
    return StyleSheet.create({

    container: {
        flex: 1,
        paddingTop: statusBarHeight + 10,
        justifyContent: 'center',
    },
    matchTypeText: {
        fontSize: 16,
        color: theme.colors.opposite,
    },
});
}
export default createMatchStyles;
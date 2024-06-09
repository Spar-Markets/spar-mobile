import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createGlobalStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({

    // Page Header
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    headerText: {
        color: theme.colors.text,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold'
    },
    headerBackBtn: {
        position: 'absolute',
        left: 10
    },
    primaryBtn: {
        height: 50,
        backgroundColor: theme.colors.accent,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row'
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight:'bold',
        color: theme.colors.background,
        marginLeft: 20,
    }, 

  });
};

export default createGlobalStyles;
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
        marginBottom: 10,
        marginHorizontal: 10
    },
    headerText: {
        color: theme.colors.text,
        textAlign: 'center',
        fontSize: 20,
        fontFamily: 'InterTight-Black',
    },
    headerBackBtn: {
        position: 'absolute',
        left: 10
    },
    headerRightBtn: {
        position: 'absolute',
        right: 10,
        top: -6
    },
    primaryBtn: {
        height: 50,
        backgroundColor: theme.colors.accent,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal:20
    },
    primaryBtnText: {
        fontSize: 16,
        color: theme.colors.background,
        fontFamily: 'InterTight-Black',
    }, 


  });
};

export default createGlobalStyles;
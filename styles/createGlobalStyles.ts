import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createGlobalStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({

    // Page Header
    headerContainer: {
        flexDirection: 'row',
        display: 'flex',


    },
    headerText: {
        color: theme.colors.text,
        fontSize: 16,
        fontFamily: 'InterTight-Bold',
    },
    headerBackBtn: {
        marginLeft: 20,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center'
    },
    headerRightBtn: {
        
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
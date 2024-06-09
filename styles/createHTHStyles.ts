import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createHTHStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({

    // EnterMatch
    container: {
      paddingTop: statusBarHeight + 10,
      backgroundColor: theme.colors.background,
      flex: 1,
      justifyContent: 'center',
      marginHorizontal: 20
    },
    hthHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    hthHeaderText: {
        color: theme.colors.text,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold'
    },
    hthHeaderBackBtn: {
        position: 'absolute',
        left: 10
    },
    matchParamsContainer: {
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        width: '100%',
        flexDirection: 'row',
        marginTop: 15,
        paddingVertical: 10,
    },
    labelTextContainer: {
        justifyContent: 'center', 
        height: 40, 
        marginVertical: 7, 
        marginLeft: 20
    },
    labelText: {
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    dropdownCollection: {
        flexDirection: 'row', 
        alignItems: 'center', 
        marginHorizontal: 10,
        marginVertical: 7
    },
    dropdown: {
        flex: 1,
        marginLeft: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        borderColor: theme.colors.tertiary,
        borderWidth: 2,
        backgroundColor: theme.colors.primary,
    },
    placeholderStyle: {
        fontSize: 18,
        color: theme.colors.text,
        paddingLeft: 20,
        fontWeight: 'bold'
    },
    selectedTextStyle: {
        fontSize: 18,
        color: theme.colors.text,
        paddingLeft: 20,
        fontWeight: 'bold'
    },
    itemsContainer: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.text,
        marginTop: 10
    },
    iconStyle: {
        marginRight: 15,
        height: 30,
        width: 30,
    },
    dropdownText: {
        color: theme.colors.text,
        fontWeight: 'bold'
    },
    enterMatchTextContainer: {
        alignItems: 'center', 
        marginHorizontal: 10,
        height: 40, 
        justifyContent: 'center',
        marginVertical: 7
    },
    enterMatchText: {
        color: theme.colors.accent,
        fontWeight: 'bold',
        fontSize: 22
    }
    

  });
};

export default createHTHStyles;
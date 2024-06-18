import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createStockSearchStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({

    // EnterMatch
    container: {
      paddingTop: statusBarHeight + 10,
      backgroundColor: theme.colors.background, 
      flex: 1
    },
    searchBox: {
        height: 40,
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginVertical: 10,
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        paddingLeft: 10,
    },
    categoryButton: {
        color: theme.colors.text,
        fontWeight: 'bold',
        padding: 10,
        fontSize: 12,
    },
    header: {
        height: 40, 
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 20
    },
    headerText: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: 'bold'
    },
    profilePic: {
      borderRadius: 100
    },
    icon: {
      color: theme.colors.text
    },
    searchCard: {
      marginHorizontal: 20,
    },
    searchTickerText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 10
    },
    searchCompanyText: {
      color: theme.colors.secondaryText,
      fontSize: 14,
      marginBottom: 10
    },
    searchCardGap: {
      height: 1,
      backgroundColor: theme.colors.primary
    },
    stockDetailsContainer: {
      paddingTop: statusBarHeight + 10,
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    stockDetailsTickerText: {
      color: theme.colors.text,
      fontWeight: 'bold',
      fontSize: 20,
    },
    stockDetailsNameText: {
      color: theme.colors.secondaryText,
      fontWeight: 'bold',
      fontSize: 14,
    },
    stockPriceText: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'right'
    },
    stockPercentText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'right'
    }
    
    
  });
};

export default createStockSearchStyles;
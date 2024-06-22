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
        marginTop:5,
        marginBottom: 10,
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
      fontWeight: 'bold',
      marginLeft: 5
    },
    profilePic: {
      borderRadius: 100
    },
    icon: {
      color: theme.colors.secondaryText
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
      fontSize: 25,
    },
    stockDetailsNameText: {
      color: theme.colors.secondaryText,
      fontWeight: 'bold',
      fontSize: 12,
      maxWidth: width/2
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
    },
    timeCardContainer: {
      borderRadius: 10,
      height: 48,
    },
    timeButtonSelectedContainer: {
      backgroundColor: '#1ae79c',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginHorizontal: 4,
      marginVertical: 4,
      height: 40,
      paddingHorizontal: 5
    },
    timeButtonSelectedText: {
      color: theme.colors.background,
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontFamily: 'InterTight-Black',
      fontSize: 15,
    },
    timeButtonContainer: {
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginHorizontal: 4,
      marginVertical: 4,
      height: 40,
      paddingHorizontal: 5
    },
    timeButtonText: {
      color: '#1ae79c',
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontFamily: 'InterTight-Black',
      fontSize: 15,
    },
    subjectLabel: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    overviewText: {
      color: theme.colors.text,
      fontSize: 14,
      marginTop: 5
    },
    showMoreButtonText: {
      color: theme.colors.secondaryText,
      fontWeight: 'bold',
    },
    statType: {
      color: theme.colors.secondaryText,
      fontSize: 14
    },
    statData: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 1
    },
    newsCardContainer: {
      backgroundColor: theme.colors.primary,
      width: 250,
      height: 200,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.tertiary
    },
    newsTitle: {
      color: theme.colors.text,
      fontSize: 14,
      marginHorizontal: 15,
      fontWeight: 'bold',
      marginTop: 10
    },
    bottomContainer: {
      flexDirection: 'row',
      marginHorizontal: 15,
      marginBottom: 15
    },
    bottomText: {
      color: theme.colors.secondaryText,
      fontSize: 13,
      fontWeight: 'bold'
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
    },
    headerRightBtn: {
      position: 'absolute',
      right: 0,
      paddingHorizontal: 10,
      paddingVertical: 10
    },
    headerBackBtn: {
      position: 'absolute',
      left: 0,
      paddingLeft: 10,
      paddingRight: 50,
      paddingVertical: 10
    },
    stockCardContainer: {
      borderRadius: 10,
      borderWidth: 1,
    },
    stockCardTicker: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: 'bold'
    },
    stockCardName: {
      color: theme.colors.secondaryText,
      fontSize: 12,
      maxWidth: 120
    },
    stockCardValue: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      textAlign: 'right'
    },
    stockCardDiff: {
      color: theme.colors.stockUpAccent,
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'right'
    }



    
    
  });
};

export default createStockSearchStyles;
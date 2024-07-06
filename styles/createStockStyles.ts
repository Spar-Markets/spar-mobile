import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';
import { mdiBorderColor } from '@mdi/js';

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
        color: theme.colors.text,
        fontSize: 14,
        fontFamily: 'InterTight-regular',
        marginHorizontal: 20,
        marginTop:5,
        marginBottom: 10,
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.tertiary,
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 10,
    },
    categoryButton: {
        color: theme.colors.text,
        fontFamily: 'InterTight-Bold',
        padding: 10,
        fontSize: 12,
    },
    header: {
        height: 40, 
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 20,
    },
    headerText: {
      color: theme.colors.text,
      fontSize: 24,
      fontFamily: 'InterTight-Black',
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
      fontFamily: 'InterTight-Bold',
      marginTop: 10
    },
    searchCompanyText: {
      color: theme.colors.secondaryText,
      fontSize: 14,
      marginBottom: 10,
      fontFamily: 'InterTight-Medium',
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
      fontSize: 22,
      fontFamily: 'InterTight-Bold',
    },
    stockDetailsNameText: {
      color: theme.colors.secondaryText,
      fontFamily: 'InterTight-Bold',
      fontSize: 12,
    },
    stockPriceText: {
      color: theme.colors.text,
      fontSize: 24,
      fontFamily: 'InterTight-Black',
      textAlign: 'right'
    },
    stockPercentText: {
      color: theme.colors.accent,
      fontSize: 12,
      textAlign: 'right',
      fontFamily: 'InterTight-Bold',
    },
    timeCardContainer: {
      borderRadius: 10,
      height: 48,
    },
    timeButtonSelectedContainer: {
      backgroundColor: theme.colors.primary,
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
      color: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontFamily: 'InterTight-Black',
      fontSize: 15,
    },
    subjectLabel: {
      color: theme.colors.text,
      fontSize: 20,
      fontFamily: 'InterTight-Bold',
    },
    overviewText: {
      color: theme.colors.text,
      fontSize: 14,
      marginTop: 5,
      fontFamily: 'InterTight-Medium',
    },
    showMoreButtonText: {
      color: theme.colors.secondaryText,
      fontFamily: 'InterTight-Bold',
    },
    statType: {
      color: theme.colors.secondaryText,
      fontFamily: 'InterTight-Medium',
    },
    statData: {
      color: theme.colors.text,
      fontSize: 16,
      fontFamily: 'InterTight-Bold',
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
      fontFamily: 'InterTight-Bold',
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
      fontFamily: 'InterTight-Bold',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
    },
    headerRightBtn: {
      position: 'absolute',
      right: 10,
      top: -40,
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
    },

    TradeButtonContainer: {
      position: 'absolute',
      bottom: 0,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingBottom: 40,
      paddingTop: 10,
      justifyContent: 'center',
      width: '100%',
      flexDirection: 'row',
      gap: 10
    },
    tradeButton: {
      backgroundColor: theme.colors.stockDownAccent,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10
    },
    tradeButtonText: {
      color: theme.colors.background,
      fontSize: 18,
      fontFamily: 'InterTight-Black',
      paddingVertical: 15
    },
    row: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    button: {
      flex: 1,
      paddingVertical: 15,
      justifyContent: 'center',
      alignItems: 'center'
    },
    buttonText: {
      color: theme.colors.text,
      fontSize: 30,
      fontFamily: 'InterTight-Bold',
    },
    orderFieldText: {
      color: theme.colors.text,
      fontFamily: 'InterTight-Bold',
      fontSize: 16
    },
    orderTextInput: {
      color: theme.colors.text,
      fontSize: 16,
      fontFamily: 'InterTight-Bold',
  },

  positionCardContainer: {
    borderRadius: 10,
    borderWidth: 1,
    width: (width-45)/2,
    height: 150,
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.tertiary
  },
  positionCardName: {
    color: theme.colors.secondaryText,
    fontSize: 12,
  },
  expandingCircle: {
    position: 'absolute',
    bottom: 50,
    left: width / 2,
    width: 1,
    height: 1,
    borderRadius: 0.5,
    transform: [{ translateX: -0.5 }, { translateY: -0.5 }],
    backgroundColor: theme.colors.accent
},
dimBackground: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'black',
  zIndex: 1,
},
dimTouchable: {
  flex: 1,
},
popup: {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  height: 400,
  backgroundColor: theme.colors.background,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.8,
  shadowRadius: 2,
  elevation: 5,
  borderTopColor: theme.colors.primary,
  borderTopWidth: 2,
  zIndex: 2,
 
},
popupContent: {
  paddingTop: 20,
  paddingBottom: 5
},

 



    
    
  });
};

export default createStockSearchStyles;
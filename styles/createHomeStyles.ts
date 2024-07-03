import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createHomeStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({

    // Header
    container: {
      paddingTop: statusBarHeight + 10,
      //backgroundColor: theme.colors.background,
      flex: 1,
      justifyContent: 'center',
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
      fontFamily: 'InterTight-Black'
    },
    profilePic: {
      borderRadius: 100,
      borderColor: theme.colors.tertiary,
      width: 40,
      height: 40,
      borderWidth: 1
    },
    icon: {
      color: theme.colors.text
    },
    
    // ToggleButton
    toggleContainer: {
      marginVertical: 10,
      flexDirection: 'row',
      height: 40,
      width: width,  
    },
    animatedBackground: {
      position: 'absolute',
      width: '50%',
      height: 2,
      backgroundColor: theme.colors.text,
      marginTop: 38
    },
    toggleButton: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleText: {
      color: theme.colors.text,
      fontSize: 18,
      fontFamily: 'InterTight-Black'
    },
    activeToggleText: {
      color: theme.colors.tertiaryText,
      fontFamily: 'InterTight-Black'
    },

    // Gap
    gap: {
      height: 6,
      backgroundColor: theme.colors.primary,
      marginBottom: 10
    },

    // DiscoverCard
    discoverCardContainer: {
      height: 80,
      width: '100%',
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      borderColor: theme.colors.tertiary,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    discoverCardTextContainer: {
      flex: 1, 
      margin: 20
    },
    discoverCardTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontFamily: 'InterTight-Bold'
    },
    discoverCardMessage: {
      color: theme.colors.secondaryText,
      fontSize: 12,
      fontFamily: 'InterTight-Medium'
    },
    discoverCardImage: {
      marginLeft: 10
    },

    // GameCard
    gameCardContainer: {
      backgroundColor: 'transparent',
      //borderColor: theme.colors.primary,
      width: (Dimensions.get('window').width),
    },
    gameCardPlayerText: {
      color: theme.colors.text,
      fontSize: 16,
      fontFamily: 'InterTight-Black'
    },
    gameCardPercentageContainer: {
      borderRadius: 8,
      //backgroundColor: theme.colors.primary,
      //borderWidth: 2,
      //borderColor: theme.colors.secondary
    },
    gameCardIndicator: {
      backgroundColor: theme.colors.accent,
      height: 7,
      width: 7,
      borderRadius: 5,
      marginLeft: 1,
    },
    gameCardPercentageText: {
      fontSize: 18,
      //paddingHorizontal: 10,
      paddingVertical: 3,
      fontFamily: 'InterTight-Bold',
    },
    gameCardAmountWageredContainer: {
      borderRadius: 50,
      backgroundColor: theme.colors.primary,
      borderWidth: 2,
      borderColor: theme.colors.secondary,
      marginTop: 5, 
      marginLeft: 10,
      padding: 4,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    gameCardAmountWageredText: {
      color: theme.colors.text,
      fontWeight: 'bold',
      fontSize: 14,
      fontFamily: 'InterTight-Bold',
    },
    gameCardModeContainer: {
      borderRadius: 50,
      backgroundColor: theme.colors.primary,
      marginTop: 5, 
      marginLeft: 5,
      borderWidth: 2,
      borderColor: theme.colors.secondary,
      padding: 5,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    gameCardModeText: {
      color: theme.colors.accent,
      fontWeight: 'bold',
      fontSize: 14,
      fontFamily: 'InterTight-Bold',
    },

    // Timer
    timerContainer: {
      borderRadius: 50,
      borderWidth: 2,
      borderColor: theme.colors.secondary,
      backgroundColor: theme.colors.primary,
      marginTop: 5, 
      marginLeft: 5,
      padding: 4,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 5
    },
    timeText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: 'bold',
      fontFamily: 'InterTight-Bold',
    },

    // HeadToHeadEntry
    hthContainer: {
      borderRadius: 10,
      marginTop: 10,
      justifyContent: 'center',
      width: '100%',
      paddingHorizontal: 20,
      height: 60,
      flexDirection: 'row',
      gap: 3
    },
    gradientBorder: {
      padding:3,
      borderRadius: 10,
      flexDirection: 'row',
      height: 50,
    },
    enterHTHMatchBtn: {
      height: 50,
      backgroundColor: theme.colors.text,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1
    },
    enterHTHMatchBtnText: {
      fontSize: 16,
      color: theme.colors.background,
      fontFamily: 'InterTight-Black',

    }, 
    dropdownCollection: {
      flexDirection: 'row', 
      alignItems: 'center', 
      marginHorizontal: 15,
      marginVertical: 7
    },
    dropdown: {
      flex: 1,
      marginLeft: 15,
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
      borderRadius: 10,
      marginBottom: 10
    },
    iconStyle: {
      marginRight: 15,
      height: 30,
      width: 30,
    },
    dropdownText: {
      color: theme.colors.text,
      fontWeight: 'bold',
      fontFamily: 'InterTight-Bold',
    },
    enterButton: {
      backgroundColor: theme.colors.stockDownAccent,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    //deposit bar
    depositsContainer: {
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 10,
      borderTopWidth: 1,
      borderColor: theme.colors.primary
    },
    balance: {
      color: theme.colors.text,
      fontSize: 20,
      fontFamily: 'InterTight-Black',
    },
    fundText: {
      color: theme.colors.secondaryText,
      fontSize: 15,
      fontFamily: 'InterTight-Bold',
    },
    depositBtn: {
      borderRadius: 50,
      backgroundColor: theme.colors.accent,
      justifyContent: 'center',
    },
    depositBtnText: {
      color: theme.colors.background,
      fontSize: 18,
      padding: 15,
      fontFamily: 'InterTight-Black',
    },
    inputContainer: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.tertiary,
      justifyContent: 'center'
    },
    textInputType: {
      color: theme.colors.text,
      fontSize: 14,
      marginLeft: 10,
      marginTop: 10,
      fontWeight: 'bold'
    },
    inputText: {
      height: 40, 
      paddingHorizontal: 10, 
      color: theme.colors.text,
      fontSize: 20
    },
    scrollContainer: {
      flexDirection: 'row',
    },
    column: {
      flexDirection: 'column',
      marginRight: 5,
    },
    emojiContainer: {
      margin: 5,
      padding: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
    },
    emoji: {
      fontSize: 24,
    },

  });
};

export default createHomeStyles;
import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createHomeStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({

    // Header
    container: {
      paddingTop: statusBarHeight + 10,
      backgroundColor: theme.colors.background,
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20
    },
    header: {
      height: 40, 
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
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
    
    // ToggleButton
    toggleContainer: {
      marginVertical: 10,
      flexDirection: 'row',
      height: 40,
      width: '100%',  
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
      fontWeight: 'bold'
    },
    activeToggleText: {
      color: theme.colors.tertiaryText
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
      fontSize: 14
    },
    discoverCardMessage: {
      color: theme.colors.secondaryText,
      fontSize: 12,
    },
    discoverCardImage: {
      marginLeft: 10
    },

    // GameCard
    gameCardContainer: {
      backgroundColor: 'black',
      borderColor: theme.colors.primary,
      borderRadius: 10,
      borderWidth: 2,
      width: (Dimensions.get('window').width - 40),
    },
    gameCardPlayerText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold'
    },
    gameCardPercentageContainer: {
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.primary
    },
    gameCardIndicator: {
      backgroundColor: theme.colors.accent,
      height: 7,
      width: 7,
      borderRadius: 5,
      marginLeft: 1,
    },
    gameCardPercentageText: {
      fontSize: 15,
      paddingHorizontal: 10,
      paddingVertical: 3,
      fontFamily: 'InterTight-Bold',
    },
    gameCardAmountWageredContainer: {
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      marginTop: 5, 
      marginLeft: 5,
      padding: 4,
      justifyContent: 'center',
      alignItems: 'center'
    },
    gameCardAmountWageredText: {
      color: theme.colors.text,
      fontWeight: 'bold',
      fontSize: 14
    },
    gameCardModeContainer: {
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      marginTop: 5, 
      marginLeft: 5,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      padding: 4,
      justifyContent: 'center',
      alignItems: 'center'
    },
    gameCardModeText: {
      color: theme.colors.accent,
      fontWeight: 'bold',
      fontSize: 14
    },

    // Timer
    timerContainer: {
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
      marginTop: 5, 
      marginLeft: 5,
      padding: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 5
    },
    timeText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: 'bold',
    },

    // HeadToHeadEntry
    hthContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      marginTop: 10,
      justifyContent: 'center',
    },
    gradientBorder: {
      padding:3,
      borderRadius: 10,
      flexDirection: 'row',
      height: 50,
    },
    enterHTHMatchBtn: {
      height: 50,
      backgroundColor: theme.colors.background,
      borderRadius: 7,
    },
    enterHTHMatchBtnText: {
      fontSize: 16,
      fontWeight:'bold',
      color: theme.colors.background,
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
      fontWeight: 'bold'
    },
    enterButton: {
      backgroundColor: theme.colors.accent,
      width: '20%',
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
      paddingTop: 10
    },
    balance: {
      color: theme.colors.text,
      fontWeight: 'bold',
      fontSize: 20
    },
    fundText: {
      color: theme.colors.secondaryText,
      fontWeight: 'bold',
      fontSize: 15
    },
    depositBtn: {
      borderRadius: 10,
      backgroundColor: theme.colors.accent,
      justifyContent: 'center',
    },
    depositBtnText: {
      color: theme.colors.background,
      fontWeight: 'bold',
      fontSize: 18,
      padding: 15
    },

  });
};

export default createHomeStyles;
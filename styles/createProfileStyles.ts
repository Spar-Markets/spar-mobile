import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createProfileStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({

    // EnterMatch
    container: {
        paddingTop: statusBarHeight + 10,
        backgroundColor: theme.colors.background, 
        flex: 1
    }, 
    header: {
        position: 'absolute',
        flexDirection: 'row',
        top: statusBarHeight + 5,
        right: 10
    },
    headerBtn: {
        paddingHorizontal: 10,
    },
    profilePic: {
        borderRadius: 100,
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.background,
        borderWidth: 4
    },
    rankContainer: {
        backgroundColor: '#81BFB4',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius:10,
    },
    rankText: {
        fontFamily: 'InterTight-Bold',
        color: theme.colors.background
    },
    usernameText: {
        fontFamily: 'InterTight-bold',
        color: theme.colors.text,
        fontSize: 21,
    },
    bioText: {
        fontFamily: 'InterTight-bold',
        color: theme.colors.text,
        fontSize: 14,
    },
    mainContainer: {
        borderRadius: 10,
        padding: 10,
        backgroundColor: theme.colors.primary,
        marginTop: 10
    },
    mainContainerType: {
        color: theme.colors.text,
        fontFamily: 'InterTight-Bold',
    },
    mainContainerText: {
        color: theme.colors.text,
        fontFamily: 'InterTight-Bold',
        fontSize: 22
    },
    progressBarBackground: {
        borderWidth: 1, 
        borderRadius: 50,
        borderColor: theme.colors.tertiary,
        height: 15,
    },
    progressBarProgress: {
        borderRadius: 50,
        backgroundColor: theme.colors.opposite,
        flex: 1,
        width: '65.6%',
    },
    progressText: {
        color: theme.colors.secondaryText,
        fontFamily: 'InterTight-Bold'
    },
    rankIndicator: {
        height: 10, 
        width: 10, 
        borderRadius: 50, 
        backgroundColor: '#81BFB4'
    },
    rankProgressText: {
        color: theme.colors.text,
        fontFamily: 'InterTight-Bold',
        fontSize: 14
    },
    labelText: {
        color: theme.colors.text,
        fontFamily: 'InterTight-Bold',
        fontSize: 18
    },
    findFriendsBtn: {
        backgroundColor: theme.colors.opposite,
        borderRadius: 5
    },
    findFriendsBtnTxt: {
        color: theme.colors.background,
        paddingVertical: 4,
        paddingHorizontal: 10,
        fontFamily: 'InterTight-Bold',
        fontSize: 14
    },
    friendContainer: {
        alignItems: 'center',
        gap: 3,
        marginRight: 20
    },
    friendPic: {
        width: 65,
        height: 65
    },
    friendText: {
        color: theme.colors.text,
        fontFamily: 'InterTight-Bold'
    },
    searchBox: {
        height: 40,
        color: theme.colors.text,
        fontSize: 14,
        fontFamily: 'InterTight-regular',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        paddingLeft: 10,
    },
    userCardPic: {
        width: 50,
        height: 50,
        borderRadius: 500
    },
    sectionContainer: {
        flexDirection: 'row', 
        width: width-40, 
        backgroundColor: theme.colors.primary, 
        borderRadius:10, 
        alignItems: 'center',
        padding: 10, 
        gap: 20
    },
    sectionIconContainer: {
        width: 60, 
        height: 60, 
        borderRadius: 8, 
        backgroundColor: theme.colors.secondary, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.backgroundColor,
    },
    button: {
        paddingVertical: 10,
        width: width / 3, // Adjust based on your design
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: theme.colors.text,
        fontFamily: 'InterTight-Bold'
    },
    indicator: {
        height: 2,
        backgroundColor: theme.colors.opposite,
        position: 'absolute',
        bottom: 0,
    },
    scene: {
        flex: 1,
    },
    
    
    
  });
};

export default createProfileStyles;
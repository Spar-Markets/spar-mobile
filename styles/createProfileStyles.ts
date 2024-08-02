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
        borderRadius: 500,
        width: 110,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary
    },
    rankContainer: {
        backgroundColor: '#81BFB4',
        paddingVertical:5 ,
        paddingHorizontal: 10,
        borderRadius:10,
    },
    rankText: {
        fontFamily: 'InterTight-Bold',
        color: theme.colors.background
    },
    usernameText: {
        fontFamily: 'InterTight-Black',
        color: theme.colors.text,
        fontSize: 20,
    },
    bioText: {
        fontFamily: 'InterTight-Medium',
        color: theme.colors.text,
        fontSize: 15,
        marginHorizontal: 20,
        textAlign: 'center'
    },
    mainContainer: {
        borderRadius: 10,
        padding: 10,
        backgroundColor: theme.colors.primary,
        marginTop: 10
    },
    mainContainerType: {
        color: theme.colors.text,
        fontFamily: 'InterTight-Regular',
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
        width: 40,
        height: 40,
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
    }
    
    
    
  });
};

export default createProfileStyles;
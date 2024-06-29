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
        flexDirection: 'row',
        marginHorizontal: 10, 
        gap: 10,
        paddingBottom: 10
    },
    headerBtn: {
        paddingHorizontal: 10,
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 10,
        paddingVertical: 10
    },
    profilePic: {
        borderRadius: 50,
        width: 100,
        height: 100,
        borderWidth: 2,
        borderColor: '#81BFB4'
    },
    rankContainer: {
        backgroundColor: '#81BFB4',
        paddingVertical:5 ,
        paddingHorizontal: 10,
        borderRadius:10,
        position: 'absolute',
        bottom: 0,
        left: (width)/2 - 20
    },
    rankText: {
        fontFamily: 'InterTight-Bold',
        color: theme.colors.background
    },
    usernameText: {
        fontFamily: 'InterTight-Black',
        color: theme.colors.text,
        textAlign: 'center',
        marginTop: 20,
        fontSize: 20
    },
    mainContainer: {
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#81BFB4',
        paddingVertical: 5,
        paddingHorizontal: 15,
        flex: 1
    },
    mainContainerType: {
        color: theme.colors.tertiary,
        fontFamily: 'InterTight-Regular',
        fontSize: 15
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
    }
    
    
    
  });
};

export default createProfileStyles;
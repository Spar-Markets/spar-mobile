import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';
import { FontWeight } from '@shopify/react-native-skia';

const createFeedStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({
    
    // Header
    container: {
      paddingTop: statusBarHeight + 10,
      backgroundColor: theme.colors.background,
      flex: 1,
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
        fontWeight: 'bold',
        fontSize: 24,
        marginVertical: 20,
        marginHorizontal: 20           
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        flex: 1,
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        height: 40
    },
    searchInputContainer: {
        color: theme.colors.text,
        paddingHorizontal: 10,
        fontSize: 16
    },
    profilePic: {
      borderRadius: 100
    },
    icon: {
      color: theme.colors.text
    },
    postsContainer: {
        marginHorizontal: 20,
        flex: 1
    },
    postTopContainer: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    postPic: {
        width: 25,
        height: 25,
        borderRadius: 100
    },
    usernameAndTime: {
        marginLeft: 10,
        fontWeight: 'bold',
        color: theme.colors.secondaryText
    },
    typeContainer: {
        backgroundColor: theme.colors.notification,
        borderRadius: 50
    },
    typeText: {
        color: theme.colors.text,
        fontWeight: 'bold',
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    subjectText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10
    },
    messageText: {
        color: theme.colors.text,
        marginTop: 5
    },
    mainPic: {
        marginTop: 10
    },
    postBottomContainer: {
        flexDirection: 'row',
        gap: 20,
        marginVertical: 10
    },
    votesText: {
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center'
    },


    //Comment Page
    commentsContainer: {
        paddingTop: statusBarHeight + 10,
        backgroundColor: theme.colors.background,
        flex: 1
    },
    commentInputContainer: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingTop: 12,
        paddingBottom: 12,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        marginLeft: 5,
        color: theme.colors.text,
        marginTop: 20, 
    },
    postButton: {
        backgroundColor: theme.colors.accent, 
        marginRight: 5,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20, 
    },
    postButtonText: {
        paddingHorizontal: 30,
        fontWeight:'bold',
        color: theme.colors.background
    },
    addButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        zIndex: 10,
    },


    //create post
    createPostContainer: {
        paddingTop: statusBarHeight + 10,
        backgroundColor: theme.colors.primary,
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginHorizontal: 10
    },
    createPostHeaderText: {
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 20,
        marginVertical: 20,
        marginHorizontal: 20           
    },
    headerBackBtnLeft: {
        position: 'absolute',
        left: 10
    },
    headerBtnRight: {
        position: 'absolute',
        right: 10,
        borderRadius: 50
    },
    headerBtnRightText:{
        color: theme.colors.background, 
        fontSize: 20, 
        fontWeight: 'bold', 
        paddingVertical: 10, 
        paddingHorizontal: 20
    },
    createPostTitleInputContainer: {
        color: theme.colors.text,
        fontSize: 32,
        marginHorizontal: 20,
        marginTop: 10,
        fontWeight: 'bold'
    },
    createPostTextInputContainer: {
        color: theme.colors.text,
        fontSize: 20,
        marginHorizontal: 20,
        marginTop: 10,
        fontWeight: 'bold'
    },
    categorySelect: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
    },
    categorySelectText: {
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 20
    },

    //confirm post
    confirmPostContainer: {
        paddingTop: statusBarHeight + 10,
        backgroundColor: theme.colors.background,
        flex: 1,
    },

    //comment 
    commentContainer: {
        marginTop: 10,
    },
    commentVotesText: {
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 16
    },
    gap: {
        height: 1,
        backgroundColor: theme.colors.primary,
        marginTop: 3,
        marginBottom: 12
    }
    
  });
};

export default createFeedStyles;
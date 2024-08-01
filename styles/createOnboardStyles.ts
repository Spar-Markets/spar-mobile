import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createOnboardStyles = (theme: any, width: number) => {
 const {height} = Dimensions.get('window')
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        marginTop: statusBarHeight + 30,
        marginHorizontal: 20,
        gap: 10
    },
    mainText: {
        color: theme.colors.text,
        fontSize: 28,
        fontFamily: 'InterTight-Bold',
        textAlign: 'center',
        marginTop: 20
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
    signUpBtn: {
        height: 50,
        backgroundColor: theme.colors.accent,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50
    },
    signUpText: {
        fontSize: 16,
        fontWeight:'bold',
        color: theme.colors.background,
    }, 
    btnsContainer: {
        marginBottom: 50,
        marginHorizontal: 20
    },
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.accent2,
    },
    spalshText: {
        fontSize: 24,
        color: theme.colors.text,
    },
    onboardContainer: {
        gap: 10,
        flex: 1,
    },
    slide: {
        width: width,
    },
    sparText: {
        color: theme.colors.text,
        fontFamily: 'InterTight-Black',
        fontSize: 30,
        position: 'absolute',
        top: statusBarHeight + 10,
        left: 20,
    },
    onboardImageContainer: {
        borderRadius: 10,
        marginHorizontal: 20,
        width: width-40,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        zIndex: 1000,
        flex: 1
    },
    onboardScroll: {
        paddingTop: statusBarHeight + 50
    },
    onboardImage: {
        aspectRatio: 1,
        alignSelf: 'center',
        width: '80%',
        height: '80%',
    },
    labelText: {
        marginTop: 20,
        fontSize: 50,
        textAlign: 'center',
        fontFamily: 'InterTight-Bold',
        color: theme.colors.text,
        paddingHorizontal: 20
    },
    text: {
        marginTop: 5,
        fontSize: 20,
        textAlign: 'center',
        paddingHorizontal: 25,
        fontFamily: 'InterTight-Medium',
        color: theme.colors.text,
    },
    textContainer: {
        width: '100%',
        flex: 1,
    },
    pagination: {
        flexDirection: 'row',
        alignSelf: 'center',
    },
    dot: {
        height: 7,
        width: 40,
        backgroundColor: theme.colors.tertiary,
        margin: 8,
        borderRadius:4,
    },
    buttonContainer: {
        paddingBottom: 50,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: theme.colors.text,
        borderRadius: 10,
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.backgroundColor,
        fontSize: 16,
        fontFamily: 'InterTight-Bold'
    },
    logInButton: {
        borderRadius: 10,
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logInText: {
        color: theme.colors.text,
        fontSize: 16,
        fontFamily: 'InterTight-Bold'
    },
    expandingCircle: {
        position: 'absolute',
        bottom: 130,
        left: width / 2,
        width: 1,
        height: 1,
        borderRadius: 0.5,
        transform: [{ translateX: -0.5 }, { translateY: -0.5 }],
    },
  });
};

export default createOnboardStyles;
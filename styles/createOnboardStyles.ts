import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createOnboardStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        marginTop: statusBarHeight + 50,
        marginHorizontal: 20,
        gap: 10
    },
    inputsContainer: {

    },
    mainText: {
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'left'
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
    },
    spalshText: {
        fontSize: 24,
        color: theme.colors.text,
    },
    
  });
};

export default createOnboardStyles;
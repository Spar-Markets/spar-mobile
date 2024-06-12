import { Dimensions, StyleSheet } from 'react-native';
import { useStatusBarHeight } from '../components/ContextComponents/StatusBarHeightContext';

const createOnboardStyles = (theme: any, width: number) => {
  const statusBarHeight = useStatusBarHeight();
  return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    onboardContainer: {
        marginTop: statusBarHeight + 50,
        marginHorizontal: 20,
    },
    mainText: {
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'left'
    },
    inputContainer: {
        padding: 5,
        backgroundColor: theme.colors.primary,
        marginTop: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.tertiary
    },
    textInputType: {
        color: theme.colors.text,
        fontSize: 14,
        marginLeft: 10,
        marginVertical: 5
    },
    inputText: {
        height: 40, 
        paddingHorizontal: 10, 
        color: theme.colors.text,
        paddingVertical: 10,
        fontSize: 20
    },
    signUpBtn: {
        height: 50,
        backgroundColor: theme.colors.accent,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signUpText: {
        fontSize: 16,
        fontWeight:'bold',
        color: theme.colors.background,
    }, 
    btnsContainer: {
        marginBottom: 50,
        marginHorizontal: 20
    }
    
  });
};

export default createOnboardStyles;
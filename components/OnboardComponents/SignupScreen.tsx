import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Button, TextInput, Alert } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createOnboardStyles from '../../styles/createOnboardStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import useAuth from '../../hooks/useAuth';
import axios from 'axios'
import { serverUrl } from '../../constants/global';


const SignupScreen = (props:any) => {

    const { user } = useAuth()

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createOnboardStyles(theme, width)

    const navigation = useNavigation<any>();

    const [emailInput, setEmailInput] = useState("")
    const [username, setUsername] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const [passwordConfirmInput, setPasswordConfirmInput] = useState("")

    /**
     * Creates user in firebase auth and in mongoDB
     * @todo need to do username check against database...
     * */
    const handleSubmit = async () => {
        if(emailInput != "" && passwordInput != "" && passwordConfirmInput != "" && username != "") {
            if (passwordInput == passwordConfirmInput) {
                try {
                    //check for username uniquesness needs to be here before auth flow
                    const credentials = await createUserWithEmailAndPassword(auth, emailInput, passwordInput)
                    //console.log(credentials)
                    const response = await axios.post(serverUrl + '/createUser', {
                        email: (credentials.user as any).email,
                        userID: (credentials.user as any).userID,
                        username: username
                    });
                   // console.log(response.data)

                    //TODO make this production level: if there is an axios error, the user will still get into firebase and the rest of app but not be in mongoDB,
                    //maybe create global hook that allows for mongoDB user population and make sure that it is populated

                } catch (error) {
                    console.log(error)
                    Alert.alert("Error creating account, please try again")
                }
            } else {
                Alert.alert("Passwords do not match")
            }
        } else {
            Alert.alert("Please make sure all fields are filled")
        }
    }

    return (
    <View style={styles.container}>
        <Text style={styles.mainText}>Create an account</Text>
        <View style={styles.inputContainer}>
            <Text style={styles.textInputType}>Email</Text>
            <TextInput
                placeholderTextColor={theme.colors.tertiary}
                onChangeText={setEmailInput}
                value={emailInput}
                style={styles.inputText}
                selectionColor={theme.colors.accent}
                maxLength={100}
                multiline
            />
        </View>
        <View style={styles.inputContainer}>
            <Text style={styles.textInputType}>Create Username</Text>
            <TextInput
                placeholderTextColor={theme.colors.tertiary}
                onChangeText={setUsername}
                value={username}
                style={styles.inputText}
                selectionColor={theme.colors.accent}
                maxLength={100}
                multiline
            />
        </View>
        <View style={styles.inputContainer}>
            <Text style={styles.textInputType}>Password</Text>
            <TextInput
                placeholderTextColor={theme.colors.tertiary}
                onChangeText={setPasswordInput}
                value={passwordInput}
                style={styles.inputText}
                selectionColor={theme.colors.accent}
                maxLength={20}
                secureTextEntry={true}
            />
        </View>
        <View style={styles.inputContainer}>
            <Text style={styles.textInputType}>Confirm Password</Text>
            <TextInput
                placeholderTextColor={theme.colors.tertiary}
                onChangeText={setPasswordConfirmInput}
                value={passwordConfirmInput}
                style={styles.inputText}
                selectionColor={theme.colors.accent}
                maxLength={20}
                secureTextEntry={true}
            />
        </View>
        <View style={{flex: 1}}></View>
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")} style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: theme.colors.text}}>Already have an account? Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpBtn} onPress={handleSubmit}>
            <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
    </View>
    )
}

export default SignupScreen;
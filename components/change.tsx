import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';

const Change = () => {
    const [prop, setProp] = useState<number | null>(null); // Assuming 'prop' is of type number

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<number>('http://your-server-url/get-prop'); // Replace with your actual server URL
                setProp(response.data); // Assuming your server sends the 'prop' value in the response
            } catch (error) {
                console.error('Error fetching prop:', error);
            }
        };

        fetchData();

        // Optionally, you can also set up a setInterval to periodically fetch updated prop values
        // const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds

        return () => {
            // clearInterval(intervalId); // Clear interval when the component unmounts
        };
    }, []);

    return (
        <View style={{ marginTop: 100 }}>
            <Text style={{ color: '#242F42', fontFamily: 'InterTight-Bold', fontSize: 30 }}>{prop !== null ? prop : 'Loading...'}</Text>
        </View>
    );
};

export default Change;

import React, {useState, FunctionComponent} from 'react';
import {SafeAreaView, ScrollView, View, Text, Image} from 'react-native';
import {Play} from './src/views/Play';
import {createAppContainer, NavigationInjectedProps} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {TextInput, Button} from 'react-native-paper';

const Home: FunctionComponent<NavigationInjectedProps> = ({navigation}) => {
  const [id, setId] = useState('');

  const play = () => {
    if (!id) {
      return;
    }
    navigation.navigate('Play', {id: id.toLowerCase()});
  };

  return (
    <SafeAreaView>
      <Image source={require('./src/assets/logo.png')} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <TextInput
            value={id}
            onChangeText={setId}
            label="Join a game"
            returnKeyType="search"
            onSubmitEditing={play}
          />
          <Button onPress={play}>Play</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MainNavigator = createStackNavigator(
  {
    Home: {screen: Home},
    Play: {screen: Play},
  },
  {
    headerMode: 'none',
  },
);

const App = createAppContainer(MainNavigator);

export default App;

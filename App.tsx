import React, {useState, FunctionComponent} from 'react';
import {SafeAreaView, ScrollView, View, Image, StyleSheet} from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <Image source={require('./src/assets/logo.png')} style={styles.image} />
      <View style={styles.scrollView}>
        <TextInput
          value={id}
          onChangeText={setId}
          label="Join a game"
          returnKeyType="search"
          onSubmitEditing={play}
        />
        <Button onPress={play}>Play</Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    margin: 15,
  },
});

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

import React, {useState, FunctionComponent} from 'react';
import {SafeAreaView, ScrollView, View, Image, StyleSheet} from 'react-native';
import {Play} from './src/views/Play';
import {createAppContainer, NavigationInjectedProps} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {TextInput, Button} from 'react-native-paper';
import {store} from './src/store';
import PlayService from './src/services/PlayService';

const Home: FunctionComponent<NavigationInjectedProps> = ({navigation}) => {
  const [id, setId] = useState('');

  const joinPlay = async () => {
    if (!id) {
      return;
    }

    let uuid = store.uuid;
    if (!uuid) {
      uuid = store.generateUuid();
    }

    const play = await PlayService.joinPlay(id, uuid);

    if (play) {
      navigation.navigate('Play', {id});
    }
  };

  const play = async () => {
    if (!id) {
      return;
    }

    const play = await PlayService.getRemote(id);

    if (play) {
      joinPlay();
      return;
    }

    const localPlay = await PlayService.get(id);

    if (localPlay) {
      navigation.navigate('Play', {id});
      return;
    }

    let uuid = store.uuid;
    if (!uuid) {
      uuid = store.generateUuid();
    }

    const ok = await PlayService.add(uuid, id);

    if (ok) {
      navigation.navigate('Play', {id});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('./src/assets/logo.png')} style={styles.image} />
      <View style={styles.scrollView}>
        <TextInput
          value={id}
          onChangeText={i => setId((i || '').toLowerCase())}
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

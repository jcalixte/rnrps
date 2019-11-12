import React, {FunctionComponent, useEffect, useState} from 'react';
import {Text, SafeAreaView, StyleSheet, Image, View} from 'react-native';
import bus, {SYNC_UP} from '../utils/bus';
import PlayService from '../services/PlayService';
import IPlay from '../models/IPlay';
import {NavigationInjectedProps} from 'react-navigation';
import repository from '../repository';
import {store} from '../store';
import {RockPaperScissors} from '../components/RockPaperScissors';
import {Button} from 'react-native-paper';
import {TouchableOpacity} from 'react-native-gesture-handler';

export const Play: FunctionComponent<NavigationInjectedProps> = ({
  navigation,
}) => {
  const id = navigation.getParam('id') as string;
  const [play, setPlay] = useState<IPlay | null>(null);

  const getPlay = async () => {
    const playFromDb = await PlayService.get(id);
    setPlay(playFromDb);

    if (!store.uuid) {
      store.generateUuid();
    }

    if (playFromDb && !playFromDb.player2) {
      await PlayService.joinPlay(id, store.uuid);
    }
  };

  useEffect(() => {
    bus.on(SYNC_UP, getPlay);
    repository.liveGame(id);
    getPlay();

    return () => {
      bus.removeListener(SYNC_UP, getPlay);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.image}>
        <Image source={require('../assets/logo.png')} />
      </TouchableOpacity>
      <View style={styles.container}>
        {play && <RockPaperScissors id={id} play={play} />}
      </View>
      {!play && <Text>Loading...</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    margin: 15,
  },
});

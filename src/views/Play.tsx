import React, {FunctionComponent, useEffect, useState} from 'react';
import {Text, SafeAreaView} from 'react-native';
import bus, {SYNC_UP} from '../utils/bus';
import PlayService from '../services/PlayService';
import IPlay from '../models/IPlay';
import {NavigationInjectedProps} from 'react-navigation';
import repository from '../repository';
import {store} from '../store';

export const Play: FunctionComponent<NavigationInjectedProps> = ({
  navigation,
}) => {
  const id = navigation.getParam('id') as string;
  const [play, setPlay] = useState<IPlay | null>(null);

  const getPlay = async () => {
    const playFromDb = await PlayService.get(id);
    setPlay(playFromDb);

    if (playFromDb && !playFromDb.player2) {
      store.generateUuid();
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
    <SafeAreaView>
      <Text>{JSON.stringify(play)}</Text>
    </SafeAreaView>
  );
};

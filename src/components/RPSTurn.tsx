import React, {FunctionComponent} from 'react';
import {ITurn} from '../models/IPlay';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import Player from '../enums/Player';
import Hand, {HandLabel} from '../enums/Hand';

interface RPSTurnProps {
  turns: ITurn[];
}

const RPSTurn: FunctionComponent<RPSTurnProps> = ({turns}) => {
  const finishedTurns = (turns as ITurn[])
    .filter(
      (turn: ITurn) =>
        turn[Player.Player1] !== null && turn[Player.Player2] !== null,
    )
    .reverse();

  const turnCount = finishedTurns.length;
  const list = finishedTurns.map(
    (turn, index) =>
      `${turnCount - index}. ${HandLabel[turn[Player.Player1] as Hand]} — ${
        HandLabel[turn[Player.Player2] as Hand]
      }`,
  );
  return (
    <FlatList
      style={styles.container}
      horizontal
      data={list}
      keyExtractor={item => item}
      renderItem={item => <Text>{list[item.index]}</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    height: 100,
  },
});

export {RPSTurn};

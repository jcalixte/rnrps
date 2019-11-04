import React, {FunctionComponent} from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';
import Hand, {HandLabel} from '../enums/Hand';

interface RPSCommandProps {
  id: string;
  canPlay: boolean;
  value: Hand | null;
  raise: boolean;
  onPlay: (hand: Hand) => void;
}

const RPSCommand: FunctionComponent<RPSCommandProps> = ({
  value,
  onPlay,
  canPlay,
}) => {
  const getMode = (hand: Hand) => {
    if (canPlay) {
      if (hand === value) {
        return 'contained';
      }
      return 'outlined';
    }
    return undefined;
  };

  return (
    <View>
      <Button
        mode={getMode(Hand.Rock)}
        disabled={!canPlay}
        onPress={() => onPlay(Hand.Rock)}>
        {HandLabel[Hand.Rock]}
      </Button>
      <Button
        mode={getMode(Hand.Paper)}
        disabled={!canPlay}
        onPress={() => onPlay(Hand.Paper)}>
        {HandLabel[Hand.Paper]}
      </Button>
      <Button
        mode={getMode(Hand.Scissors)}
        disabled={!canPlay}
        onPress={() => onPlay(Hand.Scissors)}>
        {HandLabel[Hand.Scissors]}
      </Button>
    </View>
  );
};

export {RPSCommand};

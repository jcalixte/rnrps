import React, {FunctionComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text} from 'react-native-paper';
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
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          mode={getMode(Hand.Rock)}
          disabled={!canPlay}
          onPress={() => onPlay(Hand.Rock)}>
          <Text style={styles.button}>{HandLabel[Hand.Rock]}</Text>
        </Button>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          mode={getMode(Hand.Paper)}
          disabled={!canPlay}
          onPress={() => onPlay(Hand.Paper)}>
          <Text style={styles.button}>{HandLabel[Hand.Paper]}</Text>
        </Button>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          mode={getMode(Hand.Scissors)}
          disabled={!canPlay}
          onPress={() => onPlay(Hand.Scissors)}>
          <Text style={styles.button}>{HandLabel[Hand.Scissors]}</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  buttonContainer: {
    margin: 5,
  },
  button: {
    fontSize: 40,
  },
});

export {RPSCommand};

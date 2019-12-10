import React, {FunctionComponent, useState, useEffect} from 'react';
import IPlay, {ITurn} from '../models/IPlay';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {store} from '../store';
import Hand from '../enums/Hand';
import {Title, Text} from 'react-native-paper';
import Player from '../enums/Player';
import PlayService from '../services/PlayService';
import {RPSCommand} from './RPSCommand';
import {RPSTurn} from './RPSTurn';

interface RockPaperScissorsProps {
  id: string;
  play: IPlay;
}

const RockPaperScissors: FunctionComponent<RockPaperScissorsProps> = ({
  id,
  play,
}) => {
  const {uuid} = store;
  const [play1, setPlay1] = useState<Hand | null>(null);
  const [play2, setPlay2] = useState<Hand | null>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [isPlayer2, setIsPlayer2] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);

  const hasPlayer1Played = !isPlayer1 && play1 !== null;

  const hasPlayer2Played = !isPlayer2 && play2 !== null;

  const playerNumber = () => {
    switch (uuid) {
      case play.player1:
        return Player.Player1;
      case play.player2:
        return Player.Player2;
      default:
        return null;
    }
  };

  const updatePlayerScores = () => {
    setPlayer1Score(
      play.turns.filter(turn => turn.winner === Player.Player1).length,
    );
    setPlayer2Score(
      play.turns.filter(turn => turn.winner === Player.Player2).length,
    );
  };

  const updatePlay = async () => {
    const lastTurn = [...play.turns].pop() || null;
    if (!lastTurn) {
      return;
    }

    if (
      lastTurn[Player.Player1] === null &&
      lastTurn[Player.Player2] === null
    ) {
      setPlay1(null);
      setPlay2(null);
    } else if (isPlayer2) {
      setPlay1(lastTurn[Player.Player1]);
    } else if (isPlayer1) {
      setPlay2(lastTurn[Player.Player2]);
    }

    const pNumber = playerNumber();

    if (pNumber && (await PlayService.newTurn(id, pNumber))) {
      setPlay1(null);
      setPlay2(null);
    }
  };

  const updatePlayAfterPlay1 = async () => {
    if (play1 === null || !isPlayer1) {
      return;
    }
    await PlayService.setPlay(id, Player.Player1, play1);
  };

  const updatePlayAfterPlay2 = async () => {
    if (play2 === null || !isPlayer2) {
      return;
    }
    await PlayService.setPlay(id, Player.Player2, play2);
  };

  const initPlayerRoles = () => {
    if (!play) {
      return;
    }

    const {player1, player2} = play;
    setIsSpectator(![player1, player2].includes(uuid));
    setIsPlayer1(player1 === uuid);
    setIsPlayer2(player2 === uuid);
  };

  useEffect(updatePlayerScores, [play]);
  useEffect(() => {
    updatePlayAfterPlay1();
  }, [play1]);
  useEffect(() => {
    updatePlayAfterPlay2();
  }, [play2]);
  useEffect(() => {
    updatePlay();
    initPlayerRoles();
  }, [play]);

  return (
    <View style={styles.baseContainer}>
      <View style={styles.container}>
        <View style={styles.playerContainer}>
          {isSpectator && (
            <Title numberOfLines={2}>
              Player 1 {hasPlayer1Played && 'played!'}
            </Title>
          )}
          {isPlayer1 && <Title numberOfLines={2}>you!</Title>}
          {isPlayer2 && (
            <Title numberOfLines={2}>
              opponent {hasPlayer1Played && 'played!'}
            </Title>
          )}
          <View>
            <Text>{player1Score}</Text>
          </View>
          <RPSCommand
            id={id}
            canPlay={isPlayer1}
            raise={isPlayer1}
            value={play1}
            onPlay={setPlay1}
          />
        </View>
        <View style={styles.playerContainer}>
          {isSpectator && (
            <Title numberOfLines={2}>
              Player 2 {hasPlayer2Played && 'played!'}
            </Title>
          )}
          {isPlayer1 && (
            <Title numberOfLines={2}>
              opponent {hasPlayer2Played && 'played!'}
            </Title>
          )}
          {isPlayer2 && <Title numberOfLines={2}>you!</Title>}
          <View>
            <Text>{player2Score}</Text>
          </View>
          <RPSCommand
            id={id}
            canPlay={isPlayer2}
            raise={isPlayer2}
            value={play2}
            onPlay={setPlay2}
          />
        </View>
      </View>
      <View>
        <RPSTurn turns={play.turns} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export {RockPaperScissors};

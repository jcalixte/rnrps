import React, {FunctionComponent, useState, useEffect} from 'react';
import IPlay from '../models/IPlay';
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

  const lastTurn = () => {
    const turns = play.turns;
    return [...turns].pop() || null;
  };

  const isPlayer1 = play.player1 === uuid;

  const isPlayer2 = play.player2 === uuid;

  const hasPlayer1Played = !isPlayer1 && play1 !== null;

  const hasPlayer2Played = !isPlayer2 && play2 !== null;

  const isSpectator = () => {
    const {player1, player2} = play;
    return ![player1, player2].includes(uuid);
  };

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
    const lTurn = lastTurn();
    if (!lTurn) {
      return;
    }
    if (isPlayer2) {
      setPlay1(lTurn[Player.Player1]);
    }

    if (isPlayer1) {
      setPlay2(lTurn[Player.Player2]);
    }

    if (lTurn[Player.Player1] === null && lTurn[Player.Player2] === null) {
      setPlay1(null);
      setPlay2(null);
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

  useEffect(updatePlayerScores, [play]);
  useEffect(() => {
    updatePlayAfterPlay1();
  }, [play1]);
  useEffect(() => {
    updatePlayAfterPlay2();
  }, [play2]);
  useEffect(() => {
    updatePlay();
  }, [play]);

  return (
    <SafeAreaView>
      <View>
        <View style={styles.container}>
          <View style={styles.playerContainer}>
            {isSpectator() && (
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
            {isSpectator() && (
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

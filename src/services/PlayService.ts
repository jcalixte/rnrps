import IPlay, {ITurn} from '../models/IPlay';
import repository from '../repository';
import uuid from 'uuid/v4';
import Player from '../enums/Player';
import Hand from '../enums/Hand';

interface Aggregation {
  [Player.Player1]: number;
  [Player.Player2]: number;
}

class PlayService {
  public async add(userId: string, id?: string): Promise<string | null> {
    if (id) {
      const remotePlay = await repository.getRemote<IPlay>(id);
      if (remotePlay) {
        return null;
      }
    }

    const play: IPlay = {
      _id: this.addSuffix(id || uuid(), Player.Player1),
      doctype: 'play',
      player1: userId,
      player2: null,
      turns: [],
    };

    const result = await repository.save(play);
    return result ? play._id : null;
  }

  public async joinPlay(id: string, userId: string): Promise<IPlay | null> {
    const play = await repository.getRemote<IPlay>(
      this.addSuffix(id, Player.Player1),
    );
    if (!play) {
      return null;
    }

    if ([play.player1, play.player2].includes(userId) || play.player2) {
      return play;
    }
    play.player2 = userId;

    const saveOk = await repository.saveRemote(play);

    const secondPlayerPlay: IPlay = {
      ...play,
      _id: this.addSuffix(id, Player.Player2),
      _rev: undefined,
    };
    await repository.save(secondPlayerPlay);

    return saveOk ? play : null;
  }

  public async get(id: string): Promise<IPlay | null> {
    try {
      const play1 = await repository.get<IPlay>(
        this.addSuffix(id, Player.Player1),
      );
      const play2 = await repository.get<IPlay>(
        this.addSuffix(id, Player.Player2),
      );

      return this.mergePlays(play1, play2);
    } catch (error) {
      return null;
    }
  }

  public async getRemote(id: string): Promise<IPlay | null> {
    try {
      const play1 = await repository.getRemote<IPlay>(
        this.addSuffix(id, Player.Player1),
      );
      const play2 = await repository.getRemote<IPlay>(
        this.addSuffix(id, Player.Player2),
      );

      return this.mergePlays(play1, play2);
    } catch (error) {
      return null;
    }
  }

  private mergePlays(play1: IPlay | null, play2: IPlay | null): IPlay | null {
    if (!play1 || !play2) {
      return play1 || play2;
    }
    const play = {
      ...play1,
      ...play2,
    };
    const turnCount = Math.max(play1.turns.length, play2.turns.length);

    if (!turnCount) {
      play.turns = [];
    } else {
      play.turns = Array.from({length: turnCount}).map((_item, index) => {
        const turn1 = play1.turns[index];
        const turn2 = play2.turns[index];

        const player1 = turn1 ? turn1.player1 : null;
        const player2 = turn2 ? turn2.player2 : null;

        const turn: ITurn = {
          player1,
          player2,
          winner: null,
        };

        turn.winner = this.getWinner(turn);
        return turn;
      });
    }
    return play;
  }

  public addSuffix(id: string, player: Player): string {
    return `${id}_${player}`;
  }

  public async setPlay(id: string, player: Player, hand: Hand | null) {
    const play = await repository.get<IPlay>(this.addSuffix(id, player));

    if (!play) {
      return false;
    }
    const lastTurn = [...play.turns].pop();

    if (lastTurn && lastTurn[player] === hand) {
      return false;
    }

    play.turns.pop();

    if (lastTurn) {
      const turn: ITurn = {
        ...lastTurn,
        [player]: hand,
      };
      turn.winner = this.getWinner(turn);
      play.turns.push(turn);
    } else {
      play.turns.push({
        player1: null,
        player2: null,
        winner: null,
        [player]: hand,
      });
    }

    await repository.save(play);
    return true;
  }

  public async getAll(): Promise<IPlay[]> {
    return repository.getAll<IPlay>();
  }

  public async newTurn(id: string, player: Player): Promise<boolean> {
    const merged = await this.get(id);
    if (!merged) {
      return false;
    }
    const lastTurn = [...merged.turns].pop();

    if (lastTurn && (lastTurn.player1 === null || lastTurn.player2 === null)) {
      return false;
    }

    const play = await repository.get<IPlay>(this.addSuffix(id, player));

    if (!play) {
      return false;
    }

    play.turns = [...merged.turns];

    play.turns.push({
      [Player.Player1]: null,
      [Player.Player2]: null,
      winner: null,
    });
    await repository.save(play);
    return true;
  }

  public hasUserWon(uuid: string, play: IPlay): boolean {
    const winner = this.getPlayWinner(play.turns);
    if (!winner) {
      return false;
    }
    return play[winner] === uuid;
  }

  public getPlayWinner(turns: ITurn[]): Player | null {
    const aggr = turns.reduce(
      (obj: Aggregation, turn) => {
        if (!turn.winner) {
          return obj;
        }
        obj[turn.winner]++;
        return obj;
      },
      {
        [Player.Player1]: 0,
        [Player.Player2]: 0,
      },
    );
    if (aggr[Player.Player1] === aggr[Player.Player2]) {
      return null;
    }
    return aggr[Player.Player1] > aggr[Player.Player2]
      ? Player.Player1
      : Player.Player2;
  }

  private getWinner(turn: ITurn) {
    const play1 = turn.player1;
    const play2 = turn.player2;
    if (play1 === null || play2 === null) {
      return null;
    }
    switch (play1) {
      case Hand.Paper:
        if (play2 === Hand.Rock) {
          return Player.Player1;
        } else if (play2 === Hand.Scissors) {
          return Player.Player2;
        }
        break;
      case Hand.Rock:
        if (play2 === Hand.Scissors) {
          return Player.Player1;
        } else if (play2 === Hand.Paper) {
          return Player.Player2;
        }
        break;
      case Hand.Scissors:
        if (play2 === Hand.Paper) {
          return Player.Player1;
        } else if (play2 === Hand.Rock) {
          return Player.Player2;
        }
        break;
    }
    return null;
  }
}

export default new PlayService();

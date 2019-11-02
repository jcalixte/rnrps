import Hand from '../enums/Hand';
import Player from '../enums/Player';
import IDocument from './IDocument';

export default interface IPlay extends IDocument {
  player1: string;
  player2: string | null;
  turns: ITurn[];
}

export interface ITurn {
  [Player.Player1]: Hand | null;
  [Player.Player2]: Hand | null;
  winner: Player | null;
}

# Sync

```TypeScript
// Repository/index.ts

public liveGame(id: string): void {
  this.cancelLive();
  const ids = [`${id}_${Player.Player1}`, `${id}_${Player.Player2}`];
  this.sync = this.local
    .sync<{}>(this.remote, {
      live: true,
      retry: true,
      doc_ids: ids,
    })
    .on('change', result => {
      console.log('change', result);
      bus.emit(SYNC_UP, {
        id,
        result,
      });
    });
}
```

# Merge

```TypeScript
// PlayService.ts

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
```

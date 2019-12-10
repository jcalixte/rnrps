### Sync

We want to share in real time a document `Play`. How to do so? We are going to replicate the local database and the database from the server. PouchDb has a really good method for it called `sync` and it is used like this : `localDB.sync(remoteDB)`. This method is a shortcut for :

```TypeScript
localDB.replicate.to(remoteDB);
localDB.replicate.from(remoteDB);
```

`sync` has options, and if we adapt it for our game, we want:

- a live sync so we add the property `sync` to `true`,
- a synchronisation that persists and retry when there are connection problems so we put the `retry`prop to `true`.
- We don't want to synchronise the whole database but only the current game! Hopefully, CouchDb and PouchDb can manage that for us with a [filtered replication](https://pouchdb.com/api.html#replication). There are many ways to do a filtered replication but the most efficient is to give to `sync` the array of ids we want to listen to.

For more details, I suggest you see the excelent [PouchDb documentation](https://pouchdb.com/guides/replication.html#setting-up-sync)

So, if we see the whole code, here we have:

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

In conclusion this is pretty simple and intuitive, isn't it?
We added an event `SYNC_UP` to make our `React` component reactive. We will listen to it later.

### Merge

In a game, each player will update his own document so we will not have to deal with conflicts. But our component just want to handle one document `Play` to display plays and scores. So we have a final work to do, we need to fetch the two documents in the database and merge them into one.

It is done in the file `PlayService.`, we can call this method `mergePlays` where we use a spread operator to merge the two documents. There is a little more work when we want to gather play turns in which each players update their moves. We loop through each `turn`, retrieve the move of the player 1 in the player 1's document and retrieve the move of the player 2 in the player 2's document. Like this:

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

# Live sync in React Native with CouchDb

## Intro

In this tutorial I will show you how to create a live game with data updating on multiple devices.

Let's start with something fun and basic! A game in which two people will be able to play together online. Let's make a live `Rock - Paper - Scissors` game. I've already programmed it [here](https://github.com/jcalixte/rnrps) so we can focus straight away on the cool stuff 😄.

This is a perfect opportunity to see how to build live data syncs in a mobile app with CouchDb. You'll of course be able to exploit these two technologies in many more use cases but this is a good way to start.

Thanks to CouchDb we don't need to build any backend! By the end we'll have a React Native app connected to a local CouchDb database. This basic game will help us concentrate on the essentials parts: the live sync & update on our React component. Feel free to explore the components to understand how it's displayed. Let's start!

## 1. Overview

### Rock-Paper-Scissors

What exactly will our online game be able to do?

The famous and popular Rock-Paper-Scissors will be played by two people who will join the game thanks to its id. Other users will also be able to participate and join as spectators. Afer each round, the app will update the game and at the end display the final score.

Here a quick demo of what a player will see.

![Demo](./assets/rps-demo.gif)

First steps are to clone the [repo](https://github.com/jcalixte/rnrps) and simply run the command `yarn`.

### What is CouchDb

Before getting deeper into the app, it seems primordial to first know the technology behind it.

#### CouchDb

CouchDb is a NoSQL database accessible via a RESTFUL API. The singularity of CouchDb is that data are immutables. Each update of a document (NoSQL data) is a new document linked to its previous versions by a common `_id`. So, like in git, a historic tree can be made listing all the modifications of a document. Each update modifies the property `_rev` like `_rev: 12-ad32d26`. This is the version of the document (`_rev` is for `revision` 🤫).

CouchDb masters in database replications. As it's possible to know what has been modified by an `_id` and a `_rev` prop, it's easy for a database to distinguish a delta and replicate from another one. At this stage the most important will be the replication of a distant database to a local one.

[CouchDb Documentation](https://docs.couchdb.org/en/stable/)

To work on our game, we'll need to install CouchDb locally.

### Installation

To install CouchDb locally, go to their [website](https://docs.couchdb.org/en/latest/install/index.html).

#### Configuration

Create an admin and configure CouchDb as a single node.

#### Create the `RPS` database

Then, go to the "Databases" tab and create de database called `rps`.

![Install CouchDB](./assets/create-db.png)

![Name Database](./assets/name-db.png)

#### Install CouchDb in React Native

Easy! You only have to do a `yarn add pouchdb-react-native` and you're set!

#### PouchDb

If CouchDb can store data in a server, PouchDb helps us manipulate data in locale database. PouchDb is close to CouchDb as they share the same API! And this is so cool!

[PouchDb Documentation](https://pouchdb.com/guides/replication.html)

## Let's dive into the code!

### Sync

We want to share a document `Play` in real-time. How do we do that? We are going to replicate the local database and the database from the server. PouchDb has a really good method for it called `sync`. If there is one reason to use PouchDb it's for the `sync` method! Take a look at this quote from PouchDb documentation:

> CouchDB was designed with sync in mind, and this is exactly what it excels at. Many of the rough edges of the API serve this larger purpose. For instance, managing your document revisions pays off in the future, when you eventually need to start dealing with conflicts.

We use it this way: `localDB.sync(remoteDB)`. This method is a shortcut for:

```TypeScript
localDB.replicate.to(remoteDB);
localDB.replicate.from(remoteDB);
```

`sync` has many options and in our case we'll need the following settings:

- a live sync so we add the property `sync` to `true`,
- a synchronization that persists and retry when there are connection problems. So we define the `retry` prop as `true`.
- We don't want to synchronize the whole database, only the current game. Fortunately, CouchDb and PouchDb can manage that for us with a [filtered replication](https://pouchdb.com/api.html#replication). There are many ways to do a filtered replication but the most efficient one is to give to `sync` the array of ids we want to listen to.

For more details, I recommend this excellent [PouchDb documentation](https://pouchdb.com/guides/replication.html#setting-up-sync)

If we have a look at the whole code, this what we should see:

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

This is pretty simple, isn't it?
We added an event `SYNC_UP` to make our `React` component reactive. We'll listen to it later.

### Merge

During a game each player will update his own document so we won't have to deal with conflicts. But our component can only handle one document `Play` to display plays and scores. At this stage we only have one work left to do: to fetch the two documents in the database and merge them into one.

In the file `PlayService.`, we'll call the method `mergePlays` where we use a spread operator to merge the two documents. But there is a little more work to do when we want to gather play `turns` (in which each player updates their moves). For each `turn`, we retrieve the move of the player 1 in the player 1's document and the move of the player 2 in the player 2's document. Like this:

```TypeScript
// PlayService.ts

private mergePlays(play1: IPlay | null, play2: IPlay | null): IPlay | null {
  // If one of these two documents is null just return the other one.
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

### The React Native component

Now that all the settings are in place to sync, it's finally time to display our game on screen. The code below is the page `Play` after the player submits the game id in the home page. We can initialize the liveGame; telling PouchDb to only syncs documents we need.

When fetching the play if there is no player 2, we join the play 🙂.

We can listen to changes by adding a listener to the `SYNC_UP` event from our PouchDb repository.

```tsx
// src/views/Play.tsx

const id = navigation.getParam('id') as string;
const [play, setPlay] = useState<IPlay | null>(null);

const getPlay = async () => {
  const playFromDb = await PlayService.get(id);
  setPlay(playFromDb);

  // ...

  // If there is no player 2 when fetching the game, we'll be able to join in.
  if (playFromDb && !playFromDb.player2) {
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
```

## A picture is worth a thousand words

For a quick sum up, find below the 3 main steps:

1. Player 1 creates the play
   - Player 1 saves a local document
   ```json
   {
     "_id": "12345-player1",
     "player1": "uuid-player1",
     "player2": "",
     "turns": [],
     "_rev": "1-abc"
   }
   ```
   - The app right after syncs with the server and saves the document
   - Player 1 waits for a Player 2 to come by listening to any updates from the server of documents with ids "12345-player1" and "12345-player2"

![Step 1](./assets/step-1.png)

2. Player 2 joins the play
   - Player 2 joins the play by fetching and updating the player 1's with his uuid in 'player2' attribute.
   - Player 2 creates a local document
   ```json
   {
     "_id": "12345-player2",
     "player1": "uuid-player1",
     "player2": "uuid-player2",
     "turns": [],
     "_rev": "1-bcd"
   }
   ```
   - Player 2's app syncs with the database and saves the two documents

![Step 2](./assets/step-2.png)

3. The play is ready
   - Player 1 gets the updates and is now ready to play the first round
   - Player 1 and player 2 save their document locally and then share them with the server. That way every player receives updates from their opponent.
   - The app merges the two documents into one, so we can calculate who wins the round 1 and update the score.

![Step 3](./assets/step-3.png)

## Conclusion

DONE! We've completed our first live sync between two databases in React Native, awesome! There is so much more we can explore now. Here a few examples:

- create an offline-first experience app to provide a seamless usage either the app is online or offline.
- create an app that shares data in Bluetooth without the need of an Internet connection (like shareable books in a region where the Internet is expensive)
- create an app where people can collaborate in live.
- and so on...

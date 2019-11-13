# Sync

Pour rappeler le besoin initial, nous voulons partager en temps réel un document `Play`. Pour se faire, nous allons répliquer les bases de données serveur et client. PouchDb a une méthode qui permet de répliquer une donnée vers une autre qui est `localDB.sync(remoteDB)`, cette méthode est un raccourci aux méthodes :

```TypeScript
localDB.replicate.to(remoteDB);
localDB.replicate.from(remoteDB);
```

Enfin, si nous l'adaptons pour notre jeu, nous voulons :

- Une synchronisation en continu donc nous rajoutons l'option `sync` à `true`,
- Une synchronisation qui persiste et reprends s'il y a des problèmes de connexion, ce qui se fait grâce à l'option `retry` à `true`,
- Nous ne voulons pas synchroniser l'ensemble des parties faites dans l'appli, seulement la partie en cours ! Heureusement, CouchDb et PouchDb ont prévu ce cas de figure en nous permettant de faire des [réplications filtrées](https://pouchdb.com/api.html#replication). Il y a plusieurs manière de le faire ; la plus efficace est de données en option les ids désirés grâce à la propriété `doc_ids`.

Pour plus de détail voir [la documentation PouchDb](https://pouchdb.com/guides/replication.html#setting-up-sync)

Si nous regardons concrètement ce que ça donne :

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

Finalement, c'est plutôt simple et même assez intuitif !
Enfin pour rendre l'application réactive aux changement, nous ajoutons un listener et nous émettons un évènement avec les données nécessaires pour mettre à jour notre composant `React`.

# Merge

Dans une partie, chaque joueur va modifier son propre document afin d'éviter des conflits. Mais notre composant `React` lui souhaite simplement afficher une et une seule partie de Pierre-Feuille-Ciseaux. Nous allons alors ajouter un peu de logique pour récupérer les deux documents dans la base de données et n'en faire qu'un, il est temps de fusionner !

Dans `PlayService.ts`, la méthode qui nous intéresse est la méthode `mergePlays` qui finalement utilise le `spread operator` pour fusionner les deux documents.
Là où il y a un peu de travail c'est la récupération des `turns` dans lesquels nous allons prendre les choix de chaque joueur dans leur document respectif. Nous bouclons alors sur chaque `turn` et faisons la manipulation suivante :

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

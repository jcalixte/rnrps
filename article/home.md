# LIVE SYNC IN REACT NATIVE WITH COUCHDB

## SYNCHRONISATION EN DIRECT

Une fonctionnalité très appréciée pour des utilisateurs c'est la possibilité de partager des données, documents ou de jouer en direct avec d'autres utilisateurs.
Pour se faire il faut passer par plusieurs étapes :

1. Gérer des connexions WebSockets,
2. mettre à jour les documents sans écraser des modifications d'un des deux joueurs,
3. la partager à l'ensemble des contributeurs via les WebSockets.

Rien d'immédiat.

Dans cet article, nous allons réaliser un jeu de Pierre Feuille Ciseau qui gère justement toutes ces problématiques, et cela, sans avoir à gérer une partie backend ! Grâce à CouchDb. À la fin de ce billet, nous aurons une application React Native connectée à une base de données CouchDb locale qui fonctionnera du tonerre.

On voit ça ensemble ? C'est parti !

## 1. Overview

### PIERRE FEUILLE CISEAUX

Que va faire notre jeu en ligne ?
Nous allons permettre à deux personnes de s'affronter au pierre Feuille ciseaux via une URL. D'autres personnes pourront se joindre à la partie en tant que spectateur.
Nous créerons des parties qui se mettront à jour automatiquement lorsqu'un joueur jouera. Enfin, nous afficherons le score au fur et à mesure des manches jouées.

### QU’EST-CE QUE COUCHDB

Avant de réaliser l'application, il est important de comprendre la technologie que nous allons utiliser qui va nous permettre de gérer web socket et mises à jour automatique.

#### COUCHDB

CouchDb est une base de données NoSQL avec laquelle nous pouvons interagir via une API RESTFUL. La particularité de CouchDb, par rapport à MongoDb par exemple, c'est que chaque mise à jour de document (donnée unitaire en NoSQL) est un nouveau document lié à l'ancienne version par un `_id`. Les données dans une base de données CouchDb sont immuables. Ceci permet d'avoir, un peu comme pour git, un arbre d'historique des modifications pour un document, chaque mise à jour engendre une modification de la propriété `_rev` de la forme `_rev: 12-ad32d26...`, cela représente la version du document (`_rev` c'est pour `revision` 🤫).

CouchDb excelle dans la réplication de base de données. Eh oui, vu qu'il est possible de savoir ce qui a été modifié via un `_id` et une `_rev`, il est facile pour une base de données de gérer les deltas et de répliquer une base vers une autre. Ce qui nous intéressera nous, ce sera la réplication de la base de données distante à des bases de données locales.
{Insérer les liens de documentations pour CouchDb}

#### POUCHDB

Si CouchDb sert à manipuler des données sur un serveur, Pouchdb nous aide à manipuler les bases de données locales. Point important : PouchDb propose la même API pour manipuler les bases de données ; qu'elles soient locales ou distantes, et ça c'est top. Base de données locales ou distantes, même combat ! 🤺

`PouchDb` propose également une méthode extrèmement utile, la méthode `sync` !

> CouchDB was designed with sync in mind, and this is exactly what it excels at. Many of the rough edges of the API serve this larger purpose. For instance, managing your document revisions pays off in the future, when you eventually need to start dealing with conflicts.

[PouchDb Documentation](https://pouchdb.com/guides/replication.html)

La méthode `sync` nous permet d'envoyer les données modifées localement et récupérer d'éventuelle mise à jour. Elle est en fait le raccourci de deux méthodes lancées une après l'autre :

```js
localDB.replicate.to(remoteDB);
localDB.replicate.from(remoteDB);
```

L'ordre est important d'ailleurs car mettre à jour d'abord le serveur distant c'est rendre disponible par la suite sur la base de données locale des possibles conflits que la mise à jour provoquera.

## 2. Let's get our hand into some code

On se lance enfin sur cette application ? Au préalable il faut savoir installer CouchDb, que l'on va faire dans le prochain chapitre. Nous allons simplement suivre la documentation de CouchDb qui est bien faite.

Pour nous faciliter la tâche je nous ai mâché le travail https://github.com/jcalixte/rps. Clone, yarn, créer un « .env » à la racine et y ajouter la variable d'environnement l'URL vers votre serveur CouchDb.

### CouchDb installation

[CouchDb Installation](./install-couch.md)

### Qu'allons-nous stocker comme donnée ?

Il faut réfléchir à comment nous allons entreprendre le fait d'avoir deux personnes qui jouent en même temps sur une même partie. Le pire qui puisse nous arriver c'est avoir `Joueur 1` qui écrase le choix du `Joueur 2`. Alors comment faire ? Nous allons créer deux documents distincts !.

#### La donnée

Chaque joueur tiendra à jour son document sur la même partie. Nous synchroniserons chez les deux joueurs ces deux documents et c'est l'application qui fera en sorte de n'avoir qu'un seul document utilisable pour compter les points, voir qui est le vainqueur d'un tour ou de la partie complète. Ainsi, nous évitons les problèmes de conflit possible ou d'obligation à être synchrone (Bloquer les joueurs à jouer dans un ordre `Joueur 1` puis `Joueur 2`).

```json
{
  "_id": "uniqueId",
  "player1": "uuid-player1",
  "player2": "uuid-player2",
  "turns": [
    {
      "player1": 0,
      "player2": 1,
      "winner": "player-2"
    }
  ]
}
```

### Fuuuuuuusion !

Maintenant il faut être capable de rendre ces deux documents utilisables dans l'application qui, je vous le rappelle, ne gère que des parties de Pierre, Feuille, Ciseaux. Notre service `PlayService` comportera l'intelligence de rendre invisible la partie de fusion à nos composants React-Native.

## PLONGEONS-NOUS DANS LA METHODE « SYNC » !

La clé de voûte de notre système de synchronisation en direct est la méthode de Pouchdb.sync. Cette méthode permet de pousser les modifications de notre base de données locales verse serveur, puis de récupérer les changements depuis le serveur vers la base locale. Si en plus nous rajouter la propriété « live: true ». Alors ces changements sont transmis directement grâce à des web sockets initialisés automatiquement. Alors, nous ne voulons pas tout suivre en direct, non non. Seulement la partie en cours, c'est pour cela que nous utilisons l'id passé en paramètre pour demander au serveur de filtrer ce qui doit être synchroniser, il y a d'autre manière de faire mais cette méthode nous convient parfaitement et c'est la plus rapide de toute. Voici donc la règle, toute récupération ou modification se fait sur le serveur local, puis nous laissons faire la méthode Sync qui s'assure de nous enregistrer le document sur le serveur.

### Et si jamais il y a un conflit ?

Bonne question ! Que se passe-t-il si les deux joueurs modifient la même partie en même temps ? Eh bien ce sera le sujet d'un autre article où nous parlerons également de synchronisation entre deux longues sessions hors-ligne plus promptes à engendrer des conflits.
Ici, vu que qu'un seul joueur modifie un document, notre système en est prémuni, ouf !

### LA SUITE !

Comme annoncé plus haut, CouchDb est surtout utile pour sa gestion hors-ligne avec une réplication sans perte de données entre deux bases. Alors cela peut engendrer des conflits, entre deux personnes qui ont modifié chacune de leur côté un même document. Pas de panique ! Les deux versions sont enregistrées sur le serveur, ce sera ensuite à l'appli et/ou aux utilisateurs de choisir par des règles métier la version finale (par ex, fusionner les deux, ou prendre la plus récente, ou comme pour git : laisser l'utilisateur choisir attribut par attribut). Prometteur n'est-ce pas ? 🤓

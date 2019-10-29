# LIVE SYNC IN REACT NATIVE WITH COUCHDB

## SYNCHRONISATION EN DIRECT

Une fonctionnalité très appréciée pour des utilisateurs c'est la possibilité de partager des données, documents ou de jouer en direct avec d'autres utilisateurs.
Pour se faire, il faut gérer des connexions WebSockets, de mettre à jour sans écraser la donnée, de la partager à l'ensemble des contributeurs. Rien de simple.
Dans cet article, nous allons réaliser un jeu de Pierre Feuille Ciseau qui gère justement toutes ces problématiques, et cela, sans avoir à gérer une partie backend ! Grâce à CouchDb. On voit ça ensemble ? C'est parti !

## PIERRE FEUILLE CISEAUX

Que va faire notre jeu en ligne ?
Nous allons permettre à deux personnes de s'affronter au pierre Feuille ciseaux via une URL. D'autres personnes pourront se joindre à la partie en tant que spectateur.
Nous créerons des parties qui se mettront à jour automatiquement lorsqu'un joueur jouera. Enfin, nous afficherons le score au fur et à mesure des manches jouées.

## QU’EST-CE QUE COUCHDB

Avant de réaliser l'application, il est important de comprendre la technologie que nous allons utiliser qui va nous permettre de gérer web socket et mises à jour automatique.

### COUCHDB

CouchDb est une base de données NoSQL avec laquelle nous pouvons interagir via une API RESTFULL. La particularité de CouchDb, par rapport à MongoDb par exemple, c'est que chaque mise à jour de document (donnée unitaire en NoSQL) est un nouveau document lié à l'ancienne version par un \_id. Les données dans une base de données CouchDb sont immutables. Ceci permet d'avoir, un peu comme pour git, in arbre d'historique des modifications pour un document.
Grâce, CouchDb excelle dans la réplication de base de données. Eh oui, vu qu'il est possible de savoir ce qui a été modifié via un \_id et une \_rev (version d'un document), il est facile pour une base de données de gérer les deltas et de répliquer une base vers une autre. Ce qui nous intéressera nous, ce sera la réplication de la base de données distante à des bases de données locales.
{Insérer les liens de documentations pour CouchDb}

### POUCHDB

Si CouchDb sert à manipuler des données sur un serveur, Pouchdb nous aide à manipuler les bases de données locales. Point important : PouchDb propose la même API pour manipuler les bases de données ; qu'elles soient locales ou distantes, et ça c'est top. Base de données locales ou distantes, même combat !
PIERRE FEUILLE CISEAUX
On se lance enfin sur cette application ? Au préalable il faut savoir installer CouchDb, vous pouvez le faire de manière très simple en suivant la documentation.
Pour nous faciliter la tâche je nous ai mâché le travail https://github.com/jcalixte/rps. Clone, yarn, créer un « .env » à la racine et y ajouter la variable d'environnement l'URL vers votre serveur CouchDb.
PLONGEONS-NOUS DANS LA METHODE « SYNC » !
La clé de voûte de notre système de synchronisation en direct est la méthode de Pouchdb.sync. Cette méthode permet de pousser les modifications de notre base de données locales verse serveur, puis de récupérer les changements depuis le serveur vers la base locale. Si en plus nous rajouter la propriété « live: true ». Alors ces changements sont transmis directement grâce à des web sockets initialisés automatiquement. Alors, nous ne voulons pas tout suivre en direct, non non. Seulement la partie en cours, c'est pour cela que nous utilisons l'id passé en paramètre pour demander au serveur de filtrer ce qui doit être synchroniser, il y a d'autre manière de faire mais cette méthode nous convient parfaitement et c'est la plus rapide de toute. Voici donc la règle, toute récupération ou modification se fait sur le serveur local, puis nous laissons faire la méthode Sync qui s'assure de nous enregistrer le document sur le serveur.

## MAIS EN CAS DE CONFLIT ?

Bonne question ! Que se passe-t-il si les deux joueurs modifient la même partie en même temps ? Eh bien ce sera le sujet d'un autre article où nous parlerons également de synchronisation entre deux longues sessions hors-ligne plus promptes à engendrer des conflits.
Pour l'instant nous allons simplement faire en sorte que le joueur 2 joue toujours après le joueur 1.

## LA SUITE !

Comme annoncé plus haut, CouchDb est surtout utile pour sa gestion hors-ligne avec une réplication sans perte de données entre deux bases. Alors cela peut engendrer des conflits, entre deux personnes qui ont modifié chacune de leur côté un même document. Pas de panique ! Les deux versions sont enregistrées sur le serveur, ce sera ensuite à l'appli et/ou aux utilisateurs de choisir par des règles métier la version finale (par ex, fusionner les deux, ou prendre la plus récente, ou comme pour git : laisser l'utilisateur choisir attribut par attribut).

# Live sync in React Native with CouchDb

## Intro

Let's make a game! A game where players can fight against each other in live. A game where there are strategic moves and only the best wins. Let's make a `Rock - Paper - Scissors` game. What? 🙂
By the way, this game will be a good opportunity to see how to build live data syncs in React Native with CouchDb. Of course, there are many more use cases with these two technologies.

In this article, we will develop a game Rock-Paper-Scissors who can manage all of this, and, without doing any backend! Thanks to CouchDb! At the end, we will have a React Native app connected to a local CouchDb database.

Ready? Set. Go!

## 1. Overview

### Rock-Paper-Scissors

What will do exactly our online game?

Two players will play the famous Rock-Paper-Scissors just by an id. Other users will be able to join the game and be spectators. Theses games will update whenever a player plays a roud. Finally, we will display the scores.

### What is CouchDb

Before getting deep into the app, it seems important to know the techology behind.

#### CouchDb

CouchDb is a NoSQL database accessible via a RESTFUL API. The particularity is that each update of a document (NoSQL data) is a new document linked to its previous versions by a common `_id`. Data in CouchDb are immutables. So, as in git, a historic tree can be made listing all the modification of a document. Each update creates a modification of the property `_rev` like `_rev: 12-ad32d26`, this is the version of the document (`_rev` is for `revision` 🤫).

CouchDb masters in database replications. As it is possible to know what has been modified by an `_id` and a `_rev` prop, it is easy for a database de to know the delta and replicate from another one. What is important for us will be the replication of a distant database to a local one.
{Insert CouchDb documentation here}

#### PouchDb

If CouchDb is able to store data in a server, PouchDb helps us manipulate data in locale database the same way as CouchDb! This is awesome! We will implement the same methods for locale and distant database!

`PouchDb` has a very helpful method that is `sync`.

> CouchDB was designed with sync in mind, and this is exactly what it excels at. Many of the rough edges of the API serve this larger purpose. For instance, managing your document revisions pays off in the future, when you eventually need to start dealing with conflicts.

[PouchDb Documentation](https://pouchdb.com/guides/replication.html)

The method `sync` can send data locally modified et fetch updates. She is a shortcut to:

```js
localeDB.replicate.to(remoteDB);
localeDB.replicate.from(remoteDB);
```
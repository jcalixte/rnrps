# Sync

To remind us the need, we want to share in real time a document `Play`. How to do so? We are going to replicate the local database and the database from the server. PouchDb has a really good method for it called `sync` and it is used like this : `localDB.sync(remoteDB)`. This method is a shortcut for :

```TypeScript
localDB.replicate.to(remoteDB);
localDB.replicate.from(remoteDB);
```

Finally, if we adapt it for our game, we want:

- a live sync so we add the property `sync` to `true`,
- a synchronisation that persists and retry when there are connection problems

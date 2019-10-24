import PouchDB from './Pouchdb';

export const newLocalDatabase = (name: string) => {
  return new PouchDB(name, {adapter: 'react-native-sqlite'});
};

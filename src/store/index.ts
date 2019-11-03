import {observable} from 'mobx';
import {create, persist} from 'mobx-persist';
import uuid from 'uuid/v4';
import AsyncStorage from '@react-native-community/async-storage';

class ObservableStore {
  @persist
  @observable
  public uuid: string = '';

  public generateUuid() {
    if (!this.uuid) {
      this.uuid = uuid();
    }
  }
}

const hydrate = create({
  storage: AsyncStorage,
  jsonify: true,
});

export const store = new ObservableStore();
hydrate('rnrps', store);

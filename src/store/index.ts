import {observable} from 'mobx';
import {create, persist} from 'mobx-persist';
import uuid from 'uuid/v4';
import AsyncStorage from '@react-native-community/async-storage';

class ObservableStore {
  @persist
  @observable
  public uuid: string = '';

  public generateUuid() {
    let uniqueId = this.uuid;
    if (!uniqueId) {
      uniqueId = uuid();
      this.uuid = uniqueId;
    }
    return this.uuid;
  }
}

const hydrate = create({
  storage: AsyncStorage,
  jsonify: true,
});

export const store = new ObservableStore();
hydrate('rnrps', store);

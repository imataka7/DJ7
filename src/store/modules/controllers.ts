import {
  Module, VuexModule, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import store from '..';
import PlayerController from '@/models/playerController';

interface ControllerObj {
  roomId: string;
  controller: PlayerController;
}

@Module({ dynamic: true, store, name: 'controller' })
class Controllers extends VuexModule {
  public controllers: ControllerObj[] = [];

  get getControllerById() {
    return (roomId: string) => this.controllers.find(c => c.roomId === roomId)?.controller;
  }

  @Mutation
  private addController({ roomId, controller }: ControllerObj) {
    this.controllers.push({ roomId, controller });
  }

  @Mutation
  public deleteController(roomId: string) {
    this.controllers = [...this.controllers.filter(c => c.roomId !== roomId)];
  }

  @Mutation
  public updateController({ roomId, controller }: ControllerObj) {
    this.controllers = [...this.controllers.filter(c => c.roomId !== roomId)];
    this.controllers.push({ roomId, controller });
  }
}

export default getModule(Controllers);

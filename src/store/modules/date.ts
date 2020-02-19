/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */

import {
  VuexModule, Mutation, Action, Module, getModule, MutationAction,
} from 'vuex-module-decorators';
import { logger } from '@/plugins/logger';

import store from '..';

@Module({
  name: 'date', namespaced: true, store, dynamic: true,
})
class AdjustedDate extends VuexModule {
  public diff = 0;

  get now() {
    return () => Date.now() + this.diff;
  }

  @MutationAction({ mutate: ['diff'], rawError: true })
  public async init() {
    const urls = [
      'https://ntp-a1.nict.go.jp/cgi-bin/json',
      'https://ntp-b1.nict.go.jp/cgi-bin/json',
    ];

    for (let i = 0; i < urls.length; i += 1) {
      const beforeFetch = Date.now();
      const res = await fetch(urls[i]);
      const timeSpentForFetch = Date.now() - beforeFetch;

      if (res.ok) {
        const serverTime = (await res.json()).st * 1000;
        const diff = serverTime - Math.floor(timeSpentForFetch / 2) - beforeFetch;

        logger.info('adjust date', {
          content: {
            source: urls[i],
            now: beforeFetch,
            serverTime,
            timeSpentForFetch,
            diff,
          },
        });

        return {
          diff,
        };
      }
    }

    return {
      diff: 0,
    };
  }
}

export default getModule(AdjustedDate);

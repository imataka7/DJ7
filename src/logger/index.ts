import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import { Vue as IntegrationsVue } from '@sentry/integrations';

Sentry.init({
  dsn: 'https://9d2272a9d5c14d2c8697df2b5e827c37@sentry.io/2538898',
  integrations: [new IntegrationsVue({ Vue, attachProps: true, logErrors: true })],
});

type UserInfo = {
  uid: string;
  username: string;
  provider: 'Google' | 'Twitter';
  email?: string;
  userId?: string;
}

type Context = {
  action: string;
  roomId: string;
  content: any;
  width: number;
}

function initUserInfo() {
  Sentry.setUser({
    username: 'Anonymous',
    version: process.env.VUE_APP_VERSION,
  });
}

function setUserInfo(info: UserInfo) {
  Sentry.setUser({
    ...info,
    version: process.env.VUE_APP_VERSION,
  });
}

function captureException(error: any) {
  Sentry.captureException(error);
}

const loggerBase = (level: Sentry.Severity, message: string, context: Partial<Context> = {}) => {
  Sentry.setExtras(context);
  Sentry.captureMessage(message, level);
};

const info = (m: string, c: Partial<Context> = {}) => loggerBase(Sentry.Severity.Info, m, c);
const warn = (m: string, c: Partial<Context> = {}) => loggerBase(Sentry.Severity.Warning, m, c);
const error = (m: string, c: Partial<Context> = {}) => loggerBase(Sentry.Severity.Error, m, c);

const logger = {
  info,
  warn,
  error,
};

export {
  setUserInfo,
  initUserInfo,
  captureException,
};

export default logger;

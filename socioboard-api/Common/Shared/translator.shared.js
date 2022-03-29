import _ from 'underscore';
import path from 'path';
import fs from 'fs';

import LANGUAGE_CONSTANTS from '../Constants/language.constants.js';

class Translator {
  constructor() {
    const root = path.resolve();

    const locales = this.readLocalesFile(root);

    this.locales = locales;
  }

  translateChatPhraze(phrase, socket) {
    try {
      if (!_.isString(phrase)) return phrase;

      const language = this.getLanguageFromSocket(socket);

      return this.getTranslatedPhraze(phrase, language);
    } catch (error) {
      return phrase;
    }
  }

  translate(phrase, res) {
    try {
      if (!_.isString(phrase)) return phrase;

      const language = this.getLanguage(res);

      return this.getTranslatedPhraze(phrase, language);
    } catch (error) {
      return phrase;
    }
  }

  getLanguage(res) {
    const userLanguage = res?.requestUser?.language ?? LANGUAGE_CONSTANTS.DEFAULT_LANGUAGE_CODE;

    if (!LANGUAGE_CONSTANTS.LANGUAGE_CODES_LIST.includes(userLanguage)) {
      return LANGUAGE_CONSTANTS.DEFAULT_LANGUAGE_CODE;
    }

    return userLanguage;
  }

  getLanguageFromSocket(socket) {
    const userLanguage = socket?.handshake?.query?.language
      ?? socket?.user?.language
      ?? LANGUAGE_CONSTANTS.DEFAULT_LANGUAGE_CODE;

    if (!LANGUAGE_CONSTANTS.LANGUAGE_CODES_LIST.includes(userLanguage)) {
      return LANGUAGE_CONSTANTS.DEFAULT_LANGUAGE_CODE;
    }

    return userLanguage;
  }

  getTranslatedPhraze(phraze, language) {
    const translatedPhraze = this.locales[phraze][language];

    if (!translatedPhraze) return phraze;

    return translatedPhraze;
  }

  readLocalesFile(rootPath) {
    try {
      const fullPath = this.buildFilePath(rootPath);

      const rawData = fs.readFileSync(fullPath);

      return JSON.parse(rawData);
    } catch (error) {
      return null;
    }
  }

  buildFilePath(rootPath) {
    return `${rootPath}/locales/locales.json`;
  }
}

export default new Translator();

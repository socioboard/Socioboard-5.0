import config from 'config';

export const getEnvStrict = (key) => config.get(key);

export const getEnv = (key) => (config.has(key) ? config.get(key) : null);

export const getEnvDefault = (key, value) => (config.has(key) ? config.get(key) : value);

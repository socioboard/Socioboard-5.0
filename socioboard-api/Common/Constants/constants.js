export const getEnvironment = (env) => {
  switch (env) {
    case 'production':
      return 'PRODUCTION';
    case 'development':
      return 'DEVELOPMENT';
    case 'localDev':
      return 'DEVELOPMENT';
    default:
      return 'TEST';
  }
}

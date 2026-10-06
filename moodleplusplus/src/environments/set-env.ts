const setEnv = () => {
  const fs = require('fs');
  const writeFile = fs.writeFile;
  const targetPath = './src/environments/environment.ts';
  const appVersion = require('../../package.json').version;

  require('dotenv').config({
    path: 'src/environments/.env',
    override: false,
  });

  if (!process.env['API_HOST']) {
    throw new Error('API_HOST environment variable is required');
  }

  const envConfigFile = `export const environment = {
  apiHost: globalThis.location?.hostname === 'localhost' || globalThis.location?.hostname === '127.0.0.1'
    ? '/api/v1'
    : '${process.env['API_HOST']}',
  appVersion: '${appVersion}',
  production: true,
};
`;

  writeFile(targetPath, envConfigFile, (err: any) => {
    if (err) {
      throw err;
    }
  });
};

setEnv();

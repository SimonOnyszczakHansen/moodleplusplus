const setEnv = () => {
  const fs = require('fs');
  const writeFile = fs.writeFile;
  // Configure Angular `environment.ts` file path
  const targetPath = './src/environments/environment.ts';
  // Load node modules
  // const colors = require('colors');
  const appVersion = require('../../package.json').version;
  require('dotenv').config({
    path: 'src/environments/.env',
    override: false,
  });
  if (!process.env['API_HOST']) {
    throw new Error('API_HOST environment variable is required');
  }
  // `environment.ts` file structure
  const envConfigFile = `export const environment = {
  apiHost: globalThis.location?.hostname === 'localhost' || globalThis.location?.hostname === '127.0.0.1'
    ? '/api/v1'
    : '${process.env['API_HOST']}',
  appVersion: '${appVersion}',
  production: true,
};
`;
  console.log('The file `environment.ts` will be written with the following content: \n');
  writeFile(targetPath, envConfigFile, (err: any) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(`Angular environment.ts file generated correctly at ${targetPath} \n`);
    }
  });
};

setEnv();

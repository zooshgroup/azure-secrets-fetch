const getParametersFromVault = require('./azureSecrets.js');
const execFileSync = require('exec-file-sync');

if (process.argv[2]) {
  (async () => {
    const path = process.argv[2];
    const params = await getParametersFromVault(path);
    console.log(JSON.stringify(params));
  })();
}

const getParametersFromVaultSync = (path) => {
  const execResult = execFileSync(process.argv0, ['./azureSecretsSync.js', path]).toString();
  return JSON.parse(execResult);
};

module.exports = getParametersFromVaultSync;

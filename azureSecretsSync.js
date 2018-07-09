const getParametersFromVault = require('./azureSecrets.js');
const execFileSync = require('exec-file-sync');
const path = require('path');

if (process.argv[2]) {
  (async () => {
    const vaultUri = process.argv[2];
    const params = await getParametersFromVault(vaultUri);
    console.log(JSON.stringify(params));
  })();
}


const getParametersFromVaultSync = (vaultUri) => {
  const runTarget = path.resolve(__dirname, 'azureSecretsSync.js');
  const execResult = execFileSync(process.argv0, [runTarget, vaultUri]).toString();
  return JSON.parse(execResult);
};

module.exports = getParametersFromVaultSync;

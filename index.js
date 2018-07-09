const getParametersFromVault = require('./azureSecrets');
const getParametersFromVaultSync = require('./azureSecretsSync');

module.exports = {
  getParametersFromVault,
  getParametersFromVaultSync,
};


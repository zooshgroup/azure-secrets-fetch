const KeyVault = require('azure-keyvault');
const R = require('ramda');
const msRestAzure = require('ms-rest-azure');
const url = require('url');

const { clientId, clientSecret, tenantId } = require('./localCredentials');

async function authenticate() {
  if (process.env.APPSETTING_WEBSITE_SITE_NAME) {
    return msRestAzure.loginWithAppServiceMSI({ resource: 'https://vault.azure.net' });
  } else {
    return msRestAzure.loginWithServicePrincipalSecret(clientId, clientSecret, tenantId);
  }
}
const createConfigObject = (secretList) => {
  const configObject = R.reduce(R.mergeDeepRight, {}, secretList);
  return configObject;
};

const getParametersFromVault = async (vaultUri) => {
  const credentials = await authenticate();
  const client = new KeyVault.KeyVaultClient(credentials);

  const secretList = await client.getSecrets(vaultUri);

  const secretsUri = url.resolve(vaultUri, 'secrets/');
  const secretNamesOnPath = secretList
    .filter((secret) => secret.attributes.enabled === true)
    .map(({ id }) => id.replace(secretsUri, ''));

  const parsedSecretPromises = secretNamesOnPath.map(async (secretName) => {
    const secretObject = await client.getSecret(vaultUri, secretName, '');
    const parsedSecret = R.assocPath(secretName.split('--'), secretObject.value, {});
    return parsedSecret;
  });
  const parsedSecrets = await Promise.all(parsedSecretPromises);

  return createConfigObject(parsedSecrets);
};

module.exports = getParametersFromVault;

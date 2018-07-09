const KeyVault = require('azure-keyvault');
const AuthenticationContext = require('adal-node').AuthenticationContext;
const R = require('ramda');
const msRestAzure = require('ms-rest-azure');

const { clientId, clientSecret, tenantId } = require('./localCredentials');

const vaultUri = 'https://smartoffice-test.vault.azure.net/';

async function authenticate() {
  if (process.env.APPSETTING_WEBSITE_SITE_NAME) {
    return msRestAzure.loginWithAppServiceMSI({ resource: 'https://vault.azure.net' });
  } else {
    return msRestAzure.loginWithServicePrincipalSecret(clientId, clientSecret, tenantId);
  }
}

const translateToAzurePath = (path) => {
  if (path.startsWith('/')) {
    return path.slice(1).split('/').join('--');
  }
  return path.split('/').join('--');
};

const createConfigObject = (secretList) => {
  const configObject = R.reduce(R.mergeDeepRight, {}, secretList);
  return configObject;
};

const getParametersByPath = async (path) => {
  const credentials = await authenticate();
  const client = new KeyVault.KeyVaultClient(credentials);

  const azurePath = translateToAzurePath(path);
  const secretList = await client.getSecrets(vaultUri);

  const secretNamesOnPath = secretList
    .map(({ id }) => id.split('/').pop())
    .filter(name => name.startsWith(azurePath));

  const getSecretKeyWithoutPath = name => name.replace(`${azurePath}--`, '');

  const parsedSecretPromises = secretNamesOnPath.map(async (secretName) => {
    const secretObject = await client.getSecret(vaultUri, secretName, '');
    const secretKey = getSecretKeyWithoutPath(secretName);
    const parsedSecret = R.assocPath(secretKey.split('--'), secretObject.value, {});
    return parsedSecret;
  });
  const parsedSecrets = await Promise.all(parsedSecretPromises);

  return createConfigObject(parsedSecrets);
};


module.exports = getParametersByPath;

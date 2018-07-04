const KeyVault = require('azure-keyvault');
const AuthenticationContext = require('adal-node').AuthenticationContext;
const R = require('ramda');

const clientId = '4a37b788-e7be-45a7-ae26-bf1d75e84d1e';
const clientSecret = '+3cSfymtpCMQcEVZre9eh6KeJi1bZ/an1SsTiyj9eYo=';
const vaultUri = 'https://smartoffice-test.vault.azure.net/';

// Authenticator - retrieves the access token
const authenticator = (challenge, callback) => {
  const { authorization, resource } = challenge;
  // Create a new authentication context.
  const context = new AuthenticationContext(authorization);

  // Use the context to acquire an authentication token.
  return context.acquireTokenWithClientCredentials(resource, clientId, clientSecret,
    (err, tokenResponse) => {
      if (err) throw err;
      // Calculate the value to be set in the request's Authorization header and resume the call.
      const authorizationValue = `${tokenResponse.tokenType} ${tokenResponse.accessToken}`;

      return callback(null, authorizationValue);
    });
};

const credentials = new KeyVault.KeyVaultCredentials(authenticator);
const client = new KeyVault.KeyVaultClient(credentials);


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

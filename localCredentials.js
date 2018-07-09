const os = require('os');
const fs = require('fs');
const path = require('path');

const ini = require('ini');

const AZURE_PROFILE = process.env.AZURE_PROFILE || 'default';

try {
  if (!process.env.APPSETTING_WEBSITE_SITE_NAME) {
    // when running locally
    const AZURE_DIR = path.join(os.homedir(), '.azure');
    const credentialsFilePath = path.join(AZURE_DIR, 'credentials');

    const credentialsContent = fs.readFileSync(credentialsFilePath).toString();
    const credentials = ini.parse(credentialsContent);

    const profileCredentials = credentials[AZURE_PROFILE];

    module.exports = {
      clientId: profileCredentials.client_id,
      clientSecret: profileCredentials.client_secret,
      tenantId: profileCredentials.tenant_id,
    }
  } else {
    module.exports = {};
  }
} catch (err) {
  module.exports = {};
}



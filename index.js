const getParametersByPath = require('./azureSecrets');

const getParametersByPathSync = require('./azureSecretsSync');


console.log(getParametersByPathSync('/smartoffice/prod'));

module.exports = {
  getParametersByPath,
  getParametersByPathSync,
};


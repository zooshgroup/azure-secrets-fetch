# Azure Secrets Fetch

This module is responsible for loading secrets from Azure Key Vaults, similar to `aws-param-store`.

If secrets are structured with `--` as path separator, they will be parsed into the corresponding object format.

For example:

* db--username = exampleuser
* db--password = examplepw
* client--secret = examplesecret

This will get parsed into the following JS object:

```
{
  db: {
    username: "exampleuser",
    password: "examplepw",
  },
  client: {
    secret: "examplesecret"
  }
}
```

# Usage

Two functions are currently provided:

* `getParametersFromVault(vaultUri)`: returns a Promise, which will contain the parsed secrets object.
* `getParametersFromVaultSync(vaultUri)`: returns the parsed secrets object after waiting for it to become available, but this can take some time (3-5 sec).

# Node Pg Ledger

This repository contains essentials for using [pgledger](https://github.com/pgr0ss/pgledger) on the Node platform.
Pgledger is a fantastic and lightweight project for implementing a ledger system on Postgres.
By handling the heavy lifting, Pgledger enables platform-specific libraries to build on top of it
and provide convenient wrapper code for easier usage.

Node PgLedger provides strongly-typed interfaces and convenient methods for interacting with pgLedger,
making it easier to integrate ledger functionality into Node applications.

## Installation

[node-pgdledger](https://www.npmjs.com/package/node-pgledger) is published as a NPM package:
```sh
npm install node-pgledger
```

or using yarn 

```sh
yarn add node-pgledger
```
## Quick Start

Node-Pgledger  has its own database  connection that is created using [sequelize](https://github.com/sequelize/sequelize). You are free to confgiure the Sequelize instantce.

For initilize `PgLedger` you can follow this template code: 
```typescript
import { PGLedger } from "node-pgledger";

(async () => {
  const pl = await PGLedger.init({
    host: "localhost",
    port: 5432,
    database: "test-ledger",
    username: "postgres",
    password: "postgres",
  });

  // Create a test account
  const accountId = await pl.createAccount("test-account", "USD");
  console.log(accountId);

  // Closes the postgres connections
  await pl.destroy();
})();

```

### Create Account

`pgledger` supports accounts with both positive and negative balances that is configurable. Every account has a name that and a currency. There is no validation on currency code. 

```typescript
const onlyPositiveBalanceAccountId = await pl.createAccount(
  "usd-account",
  "USD",
  // Allow negative balance
  false,
  // Allow positive balance
  true,
);
```

`createAccount` returns a `PgId`. Every account and transfer on pgledger is identified by a prefixed ULID. `PgId` is an alias to string. 

> There is no batch account insertion at this point. 

### Lookup Accounts

Using an array of ids you can fetch accounts. An array of `PglAccount` instances will return. 

```typescript
const accountIds = ["pgla_01KAGDF3F9FFFS3D8ER0WPW9V0"]
const accounts = await pl.lookup(accountIds)
````

### Create transfer

Any transfer has a from account and a to account and an amount. All amounts are string.

```typescript
const fromAccountId = "pgla_01KAGDF3F9FFFS3D8ER0WPW9V0"
const toAccountId = "pgla_01KAM2M4APEQFSF0Z08BW1G7YA"
const transferId = await pl.createTransfer(fromAccountId, toAccountId, "12.2")
```

## TODOs

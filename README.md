Create the test accounts following instructions here:

https://github.com/hayeah/openzeppelin-solidity/blob/qtum/QTUM-NOTES.md#create-test-accounts

Start Janus:

```
QTUM_RPC=http://qtum:testpasswd@localhost:3889 QTUM_NETWORK=regtest go run ./cli/janus --accounts myaccounts.txt --dev
```

Build contracts with waffle:

```
yarn build
```

Run the test deploy script with:

```
yarn watch
```
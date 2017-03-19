[![Build Status](https://travis-ci.org/Atsman/node-tor-control.svg?branch=master)](https://travis-ci.org/Atsman/tor-control)

# node-tor-control
A node library to communicate with tor-control

*For basic information about tor-control please read the
[specs](https://gitweb.torproject.org/torspec.git/tree/control-spec.txt)*

## How to use

```bash
npm install tor-control --save
```

```js
const { connect, disconnect, tor } = require('tor-control');

const connection = await connect({ password: 'password' });

const status = await tor.signalNewNYM(connection);

console.log(status.code); // -> 250
console.log(status.text); // -> OK

```


// server.js — Express wrapper for packages/sample/hello/hello.js
const express = require('express');

// try common export locations: module.exports = fn OR exports.handler OR default
let handler;
try {
  handler = require('./hello.js');
  // if the file exports an object like { handler: fn } prefer that
  if (handler && typeof handler === 'object' && typeof handler.handler === 'function') {
    handler = handler.handler;
  } else if (handler && handler.default && typeof handler.default === 'function') {
    handler = handler.default;
  }
} catch (err) {
  console.error('Could not require ./hello.js', err);
  handler = null;
}

const app = express();

app.get('/', async (req, res) => {
  try {
    if (!handler || typeof handler !== 'function') {
      return res.status(500).json({ error: 'Handler not found or not a function in hello.js' });
    }

    // Try calling handler with something useful (pass req if it expects event)
    const maybePromiseOrValue = handler.length >= 1 ? handler(req) : handler();
    const result = await Promise.resolve(maybePromiseOrValue);

    // If result is object -> JSON, otherwise send as text
    if (result && typeof result === 'object') return res.json(result);
    return res.send(String(result));
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;

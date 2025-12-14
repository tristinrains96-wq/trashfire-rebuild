const { default: open } = require('open');

const url = 'http://localhost:3000/workspace';

open(url).catch(() => {
  console.log(`\n🌐 TrashFire is ready! Open your browser to: ${url}`);
});

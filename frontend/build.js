const { spawnSync } = require('child_process');

const isWindows = process.platform === 'win32';
const result = spawnSync(
  isWindows ? 'npx.cmd' : 'npx',
  ['react-scripts', 'build'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--openssl-legacy-provider',
    },
    shell: true,
  }
);

process.exit(result.status || 0);

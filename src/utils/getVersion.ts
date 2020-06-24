const { version } = require('../../package.json');

export default function getVersion(): string {
  return `v${version.replace('+', ' on ')}`;
}

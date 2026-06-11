const [major] = process.versions.node.split('.').map(Number);

if (major !== 20) {
  console.error(
    [
      '',
      'Unsupported Node.js runtime for Afroza Campus mobile.',
      `Current version: ${process.version}`,
      'Required version: v20.x',
      '',
      'Why this matters:',
      '- Expo SDK 54 / Metro use modern Array helpers like Array.prototype.toReversed().',
      '- Node 18 does not implement toReversed(), which crashes Metro with:',
      '  TypeError: configs.toReversed is not a function',
      '',
      'Fix:',
      'source ~/.nvm/nvm.sh && nvm use 20',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

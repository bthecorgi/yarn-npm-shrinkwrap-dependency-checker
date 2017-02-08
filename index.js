/**
* Usage: npm start -s <PATH_TO_SHRINKWRAP> -y <PATH_TO_YARN_LOCK>
*/
const fs = require('fs');
const exec = require('child_process').exec;

function parseYarnListOutput(stdout) {
  const output = stdout.split('\n');

  if (output.length < 896) {
    console.log(stdout);
    const react = stdout.indexOf('react@');
    console.log('react: ', stdout.substring(react, react + 20));

    console.log('Found: ', output.length);
  }

  const parsedOutput = {};

  output.forEach((line) => {
    // '├─ wrappy@1.0.2'
    const delimiter = line.indexOf('├─ ');
    if (delimiter === 0) {
      const subLine = line.substring(3);
      const nameAndVersion = subLine.split('@');

      if (nameAndVersion.length !== 2) {
        throw Error('Expecting 2 elements');
      }

      const name = nameAndVersion[0];
      const version = nameAndVersion[1];

      parsedOutput[name] = version;
    }
  });

  return parsedOutput;
}

function compareShrinkwrapToYarn(shrinkwrapDependencies, yarnDependencies) {
  Object.keys(shrinkwrapDependencies).forEach((key) => {
    const packageName = key;
    const shrinkwrapPackageVersion = shrinkwrapDependencies[key].version;

    if (yarnDependencies[packageName] !== shrinkwrapPackageVersion) {
      console.log('[Diff] ', packageName, ' => npm-shrinkwrap:', shrinkwrapPackageVersion, ' yarn version: ', yarnDependencies[packageName]);
    }
  });
}

console.log('yarn dependencies...');
exec('yarn list --depth=0', (err, stdout) => {
  if (err) throw err;

  const yarnDependencies = parseYarnListOutput(stdout);
  const shrinkWrap = fs.readFileSync('npm-shrinkwrap.json').toString();
  const shrinkWrapJson = JSON.parse(shrinkWrap);
  const shrinkwrapDependencies = shrinkWrapJson.dependencies;

  compareShrinkwrapToYarn(shrinkwrapDependencies, yarnDependencies);
});


#bin/bash
rm -rf node_modules
yarn install --frozen-lockfile
export BRANCH_ENV=master
yarn run buildDLL:dev
yarn run buildModules
yarn run start
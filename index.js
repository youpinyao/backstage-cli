#!/usr/bin/env node

const chalk = require('chalk');
const commander = require('commander');
const upgrade = require('./src/upgrade.js');
const create = require('./src/create.js');

commander
  .version(require('./package.json').version)
  .arguments('<cmd> <projectName> [version]')
  .action(function (cmd, projectName, version) {
    switch (cmd) {
      case 'create-angular':
        create(projectName, 'angular', version);
        break;
      case 'create-antd':
        create(projectName, 'antd', version);
        break;
    }
  })
  .option('upgrade', 'upgrade version', function () {
    upgrade();
  })
  .on('--help', function(){
    console.log('');
    console.log('  Examples: <cmd> [projectName] [version]');
    console.log('');
    console.log('    meetyou-backstage create-angular [projectName] [version]  create a angular1.x demo');
    console.log('    meetyou-backstage create-antd [projectName] [version]     create a antd3.x demo');
    console.log('');
  })
  .parse(process.argv);

const fs = require('fs');
const chalk = require('chalk');
const del = require('del');
const path = require('path');
const Confirm = require('prompt-confirm');
const request = require('request');
const ProgressBar = require('progress');
const decompress = require('decompress');
const exec = require('child_process').exec;
const cliSpinners = require('cli-spinners');
const ora = require('ora');
const loading = ora({
  spinner: cliSpinners.dost
});
const githubPaths = require('./githubPaths');
let githubPath = null;

function create(projectName, type, version) {

  if (!projectName) {
    console.log(chalk.red('请输入项目名称'));
    return;
  }

  // angular 或者 antd
  githubPath = githubPaths[type];

  const projectPath = path.join(process.cwd(), './', projectName);
  const ifExist = fs.existsSync(projectName);
  const isDelete = new Confirm('目录已存在, 是否删除目录（不删除目录，将会在该目录下解压项目）？');

  if (ifExist) {
    isDelete.run().then(answer => {
      if (answer) {
        del.sync([projectPath]);
        createDir(projectPath, version);
      } else {
        createDir(projectPath, version, false)
      }
    });
    return;
  }

  createDir(projectPath, version);
}

function createDir(projectPath, version, mkdir) {
  if (mkdir !== false) {
    fs.mkdirSync(projectPath);
  }
  console.log();
  console.log(chalk.green(`目录创建成功 ${projectPath}`));

  downloadProbject(projectPath, version);
}

function downloadProbject(projectPath, version) {

  const zipPath = path.join(projectPath, 'project.zip');
  const downloadPath = `${githubPath}${version || 'master'}`;

  // The options argument is optional so you can omit it
  const aaa = request(downloadPath).on('response', res => {
      let len = parseInt(res.headers['content-length'], 10);

      if (isNaN(len)) {
        len = 702709;
      }

      console.log(chalk.green(`下载中 ${downloadPath}`));
      // console.log(chalk.green(`status code : ${res.statusCode}`));
      console.log();

      const bar = new ProgressBar(chalk.yellow(`下载中 [:bar] :rate/bps :percent :etas`), {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: len
      });

      res.on('data', function (chunk) {
        bar.tick(chunk.length);
      });

      res.on('end', function () {
        // console.log();
        // console.log(chalk.green(`下载成功 ${zipPath}`));
      });
    })
    .pipe(fs.createWriteStream(zipPath))
    .on('error', function (err) {
      console.log(chalk.red(err));
    })
    .on('close', function () {
      if (fs.existsSync(zipPath)) {
        decompress(zipPath, projectPath, {
          strip: 1
        }).then(files => {
          console.log();
          console.log(chalk.green('项目初始化成功'));
          console.log();
          del.sync([zipPath]);

          console.log(chalk.green('开始加载依赖库'));
          loading.start(chalk.green('npm i'));

          exec('npm i', {
            cwd: projectPath
          }, function (err, out) {
            if (err) {
              console.log(chalk.red(err));
              return;
            }
            console.log(chalk.green(out));

            loading.stop();
            console.log(chalk.green('npm i success'));
          });
        });
      }
    });

}
module.exports = create;

# 更新记录

## 2018-02-16 v1.3.0

- 使用 yargs 代替 minimist
- 修复 package.json 未声明 co, bin 中require co 的问题

## 2018-01-28 v1.2.0

- 移除 nightmare
- 使用 music-api 包获取 playlist/album 详情, 音频文件链接
- 使用 ES6 class 组织 adapter

## 2018-01-19 v1.1.0

- 应对云音乐修改

## 2017-07-19 v1.0.0

- 使用 async/await, 要求 node >= 7.6.0
- 去除 needle-kit, 使用 fs-extra
- 去除 jsbeautifyrc, 使用 prettier
- 更新 .eslintrc.yml

## 2017-02-19 v0.11.0
- 升级依赖, nightmare 依赖 electron

## 2016-11-05 v0.10.1
- 修复 #8, 给文件名进行 `sanitize`, 去除特殊字符

## 2016-11-05 v0.10.0
- 使用 `request` & `request-promise` 重写
- eslint 使用 no semi
- 移除 `.npmignore`, package.json files 只留 `lib` & `bin`

## 2016-06-04 v0.9.0
- 增加 `.yunrc` 配置支持, 使用 `rc` 模块

## 2016-06-02 v0.8.0
- 使用 `promise.retry` 重构下载超时 / 重试部分
- 使用 `content-length` 机制做下载跳过, 之前是大于1MB就跳过
- 使用 esformatter

## 2016-04-03 0.7.0
- 修复nightmare不退出的bug
- 增加 `skip` 参数, 默认启用, 当文件存在且大于1MB时跳过下载

## 2016-04-03 v0.6.2
- 修复由于 lodash.js 升级带来的问题, see https://cnodejs.org/topic/570050f68a612c5559d16b94
- 修改默认参数, 超时, 3分钟
- 修改默认参数, 音质, 改为最低音质, 因为 192 & 320 得到的部分地址一直超时

## 2016-03-09 v0.6.1
- 使用ES6 原生Promise, 以及其他 `promise.map` `promise.ify` 等组件
- 升级nightmare@2.2.0

## 2016-02-17 v0.6.0
- 加入下载超时 & 重试次数控制

## 2016-02-16 v0.5.0
- eslint升级v2
- 使用Nightmare来获取下载地址所需的加密参数
- 加入音质选择支持, 默认最高音质, 320kbits/s

## 2015-11-01 v0.4.0
- 使用Node.js Argon release支持的ES6 feature(templateString arrowFunction)改写

## 2015-09-26 v0.3.0
- 增加filename format 支持, 见README 自定义文件名

## 2015-09-24 v0.2.0
- 直接依赖cookiejar, #3 related. 添加.jshintrc .jsbeautifyrc等.

## 2015-07-19 v0.1.0
- 云音乐更换歌曲地址加密方式, 但是有卵用的是页面上有playlist的json.
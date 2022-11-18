# 更新记录

## 2022-11-18 v3.2.2

- feat: make chunk size 500 -> 200, closes https://github.com/magicdawn/yun-playlist-downloader/issues/52

## 2022-11-14 v3.2.1

- fix broken publish

## 2022-11-14 v3.2.0

- 分片支持超大歌单, see https://github.com/magicdawn/yun-playlist-downloader/issues/51
- `umi-request` -> `got`, 前者在 node v18 会触发 warning, 使用 node internal fetch
- move to github actions
- update deps

## 2022-04-25 v3.1.0

- 支持 `--cookie` 默认读取 `yun.cookie.txt` 文件
- fix `#/radio` 网址
- 清理没有用到的 music-api encrypt 函数

## 2020-10-22 v3.0.1

- 支持 `--cover` 选项.

## 2020-10-18 v3.0.0

- 使用 TypeScript 重构.
- 使用 NeteaseCloudMusicApi.
- 修复 playlist 未登录状态只能看到前几首歌的问题.

## 2019-12-28 v2.3.0

- djradio 新增多页支持, 做功能开发看的都是少于 100 期的, 这次新增多页支持, 并新增了 DjradioAdapter 的单测

## 2019-12-03 v2.2.0

- ascii-progress 移动为 optionalDependencies, 使用 `-p false` 禁用掉调用 ascii-progress 的代码,
  see https://github.com/magicdawn/yun-playlist-downloader/issues/34

## 2019-12-01 v2.1.0

- 添加电台支持
- 使用 umi-request 代替 `superagent` / `axios` / `request` / `request-promise` / `@magicdawn/rp` 等等库

## 2019-11-21 v2.0.1

- 使用 `@magicdawn/ascii-progress` 导致无法安装的问题, see https://github.com/bubkoo/ascii-progress/issues/31
- use `@magicdawn/prettier-config` & `@magicdawn/eslint-config`

## 2019-06-11 v2.0.0

- 使用 filenamify 代替 sanitize-filename
- 添加 prettier git hook
- 添加 dl-vampire 作为下载器
- 添加 `-p, --progress` 显示进度条
- 重命名参数 `--timeout` -> `--retry-timeout`, `--max-times` -> `--retry-times`

## 2018-08-26 v1.4.0

- music-api 无法使用, 经排查, 获取下载地址接口需要带 cookie 访问, 暂时切回 nightmare

## 2018-02-16 v1.3.0

- 使用 yargs 代替 minimist
- 修复 package.json 未声明 co, bin 中 require co 的问题

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
- 使用 `content-length` 机制做下载跳过, 之前是大于 1MB 就跳过
- 使用 esformatter

## 2016-04-03 0.7.0

- 修复 nightmare 不退出的 bug
- 增加 `skip` 参数, 默认启用, 当文件存在且大于 1MB 时跳过下载

## 2016-04-03 v0.6.2

- 修复由于 lodash.js 升级带来的问题, see https://cnodejs.org/topic/570050f68a612c5559d16b94
- 修改默认参数, 超时, 3 分钟
- 修改默认参数, 音质, 改为最低音质, 因为 192 & 320 得到的部分地址一直超时

## 2016-03-09 v0.6.1

- 使用 ES6 原生 Promise, 以及其他 `promise.map` `promise.ify` 等组件
- 升级 nightmare@2.2.0

## 2016-02-17 v0.6.0

- 加入下载超时 & 重试次数控制

## 2016-02-16 v0.5.0

- eslint 升级 v2
- 使用 Nightmare 来获取下载地址所需的加密参数
- 加入音质选择支持, 默认最高音质, 320kbits/s

## 2015-11-01 v0.4.0

- 使用 Node.js Argon release 支持的 ES6 feature(templateString arrowFunction)改写

## 2015-09-26 v0.3.0

- 增加 filename format 支持, 见 README 自定义文件名

## 2015-09-24 v0.2.0

- 直接依赖 cookiejar, #3 related. 添加.jshintrc .jsbeautifyrc 等.

## 2015-07-19 v0.1.0

- 云音乐更换歌曲地址加密方式, 但是有卵用的是页面上有 playlist 的 json.

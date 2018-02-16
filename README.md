# yun-playlist-downloader
网易云音乐 - 歌单 - 下载器

[![npm version](https://img.shields.io/npm/v/yun-playlist-downloader.svg?style=flat-square)](#)
[![node version](https://img.shields.io/node/v/yun-playlist-downloader.svg?style=flat-square)](#)
[![license](https://img.shields.io/npm/l/yun-playlist-downloader.svg?style=flat-square)](#)

## 特性

- [x] 音质选择
- [x] 下载超时 / 重试
- [x] 再次下载默认跳过已下载部分, 使用 `content-length` 匹配
- [x] 自定义文件名

## 安装
需要 node.js >= 7.6.0 async/await 支持

```sh
$ npm i yun-playlist-downloader -g
```

## 使用
```sh
Usage: yun <url> [options]

位置：
  url  歌单/专辑的链接                                                  [字符串]

选项：
  -h, --help         显示帮助信息                                         [布尔]
  -v, --version      显示版本号                                           [布尔]
  -c, --concurrency  同时下载数量                             [数字] [默认值: 5]
  -f, --format       文件格式[字符串] [默认值: ":name/:singer - :songName.:ext"]
  -q, --quality      音质                                   [数字] [默认值: 320]
  -t, --timeout      下载超时(分)                             [数字] [默认值: 3]
  -s, --skip         对于已存在文件且大小合适则跳过        [布尔] [默认值: true]

示例：
  yun -c 10 <url>                          10首同时下载
  yun -f ":singer - :songName.:ext" <url>  下载格式为 "歌手 - 歌名"

帮助 & 文档: https://github.com/magicdawn/yun-playlist-downloader

缺少 non-option 参数：传入了 0 个, 至少需要 1 个
```

### 自定义文件名 -f,--format

| token     | 含义                      |
| --------- | ----------------------- |
| :type     | = `album` or `playlist` |
| :typeText | = `专辑` or `列表`          |
| :name     | 专辑名称 or 播放列表名称          |
| :singer   | 歌手名                     |
| :songName | 歌曲名(不含扩展名)              |
| :ext      | 文件后缀,如 `mp3` 不带 `.`     |
| :index    | `01` , `02` ... `12`    |
| :rawIndex | `0`, `1`, ... `11`      |

默认值 = `:name/:singer - :songName.:ext`

### 自定义下载音质 -q,--quality

| 取值   | 含义         | 备注   |
| ---- | ---------- | ---- |
| 128  | 128kbits/s |      |
| 192  | 192kbits/s |      |
| 320  | 320kbits/s | 默认   |

### 下载超时, -t,--timeout
设置下载超时, 单位为分, 默认3分钟

### 重试次数, --max-times
置下载重试次数, 需要与timeout搭配使用,默认3次

### 下载并发, -c, --concurrency
下载并发

### 是否跳过下载, --skip
- 对于文件已存在, 而且文件大小与要下载的网络文件的 `content-length` 大小一致, 则跳过下载
- 默认启用
- 使用 `--skip false` 关闭该特性

## `.yunrc`
该工具使用了 `rc` 模块, 会去遍历读取 `.yunrc` 配置文件
具体规则见 `rc` 模块 README https://github.com/dominictarr/rc#standards

## 截图
![](https://raw.githubusercontent.com/magicdawn/yun-playlist-downloader/master/yun.png)

## 已知问题
- [x] 并发过大会导致某些一开始任务即便机器处于空闲状态也会block住, 请根据自己网速酌情设置 `concurrency` 参数
- [x] 使用了类似Phantom.js的Nightmare来计算下载参数, 安装的时候要装一遍Electron, 程序体积比较大. 见谅.

## 更新记录
[CHANGELOG.md](CHANGELOG.md)

## License
the MIT License http://magicdawn.mit-license.org

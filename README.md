# yun-playlist-downloader
网易云音乐 - 歌单 - 下载器

## 安装
需要 node.js version > 4

```sh
$ npm i yun-playlist-downloader -g
```

## 使用
```sh
$ yun

  网易云音乐 歌单/专辑 下载器 v0.3.0

  使用:
    yun [选项] <地址>

  选项:
    -h,--help         查看此帮助信息
    -c,--concurrency  设置同时下载数量, 默认5
    -f,--format       设置文件格式, 默认 ':name/:singer - :songName.:ext'

  示例:
    # 10首同时下载
    yun -c 10 http://music.163.com/#/playlist?id=12583200

    # 下载格式为 '歌手 - 歌名'
    yun -f ':singer - :songName.:ext' http://music.163.com/#/playlist?id=12583200
```

### 自定义文件名

|token|含义|
|-----|---|
|:type| = `album` or `playlist`|
|:typeText| = `专辑` or `列表` |
|:name| 专辑名称 or 播放列表名称 |
|:singer| 歌手名 |
|:songName| 歌曲名(不含扩展名) |
|:ext| 文件后缀,如 `mp3` 不带 `.` |
|:index| `01` , `02` ... `12` |
|:rawIndex| `0`, `1`, ... `11` |

默认值 = `:name/:singer - :songName.:ext`

## 截图
![](https://raw.githubusercontent.com/magicdawn/yun-playlist-downloader/master/yun.png)

## 已知问题
- [x] 并发过大会导致某些一开始任务即便机器处于空闲状态也会block住, 请根据自己网速酌情设置 `concurrency` 参数

## 更新记录
- 2015-09-26 v0.3.0 增加filename format 支持, 见README 自定义文件名
- 2015-09-24 v0.2.0 直接依赖cookiejar, #3 related. 添加.jshintrc .jsbeautifyrc等.
- 2015-07-19 v0.1.0 云音乐更换歌曲地址加密方式, 但是有卵用的是页面上有playlist的json.

## License
the MIT License http://magicdawn.mit-license.org

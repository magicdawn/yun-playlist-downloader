# yun-playlist-downloader
网易云音乐 - 歌单 - 下载器

## 安装
via 万能的npm, 需要 node.js version > 1
```sh
$ npm i yun-playlist-downloader -g
```

## 使用
```sh
$ yun

  网易云音乐 歌单 下载器

  使用:
    yun [选项] <歌单地址>

  示例:
    # 20首同时下载
    yun -c 20 http://music.163.com/#/playlist?id=12583200

  选项:
    -h,--help           查看帮助
    -c,--concurrency    设置同时下载数量
```

## 截图
![](https://raw.githubusercontent.com/magicdawn/yun-playlist-downloader/master/yun.png)

## 已知问题
- [ ] 默认的并发为10, 最后会剩下一两首歌下不动, 就一直卡在那~ 目前解决办法是将 concurrency 设置的小一点,适应你的网速.

## 更新记录
- 2015-09-24 v0.2.0 直接依赖cookiejar, #3 related. 添加.jshintrc .jsbeautifyrc等.
- 2015-07-19 v0.1.0 云音乐更换歌曲地址加密方式, 但是有卵用的是页面上有playlist的json.

## License
the MIT License http://magicdawn.mit-license.org

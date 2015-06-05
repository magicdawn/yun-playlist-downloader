# yun-playlist-downloader
网易云音乐 - 歌单 - 下载器

## 安装
via 万能的npm, iojs required
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

## TODOS
- [x] 下载专辑支持,url 为album/?id=xxx 页面class id与playlist 略有不同

## License
the MIT License (magicdawn@qq.com)
# Cookie 使用说明

有些歌单, 比如「自己喜欢的歌单」需要登录查看, 使用 `--cookie` 默认读取 `yun.cookie.txt` 文件

## 安装 chrome 插件

EditThisCookie https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg

## 登录

goto https://music.163.com/#

## 使用 EditThisCookie 导出 cookie

![image](https://user-images.githubusercontent.com/4067115/165077111-7e64438d-1afa-43ef-84f7-2127f92354b1.png)

## 使用

- 新建文件 `yun.cookie.txt`
- 粘贴(上一步导出 cookie 会将内容复制到剪贴板)

## `yun --cookie`

- `yun` 会默认读取 `pwd` + `/` + `yun.cookie.txt`
- 如果不是这个名字, 或不在当前路径, 使用 `--cookie /path/to/cookie.txt` 指定即可.

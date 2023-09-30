# 掘金每日自动签到

效果视频：

<iframe src="//player.bilibili.com/player.html?aid=916559575&bvid=BV1Su4y147gM&cid=1283444267&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

为了演示自动化浏览这里开了浏览器，但实际上可以不用开启浏览器使用无头浏览器的方式在终端运行。

## 接入流程

### 前期准备

- fork 项目（顺便 star 哈哈哈~）

- 清空 /packages/common/cookies/juejin.ts 文件

- 修改 /packages/juejin/main.ts 下 手机号，改为自己的手机号

  ![image-20230930153326586](https://image.jimmyxuexue.top/img/202309301533644.png)

### 安装依赖

项目根目录下执行

```
pnpm install
```

### 本地运行一次

这次运行需要配合手机接收一次验证码，会自动将登录后的 cookie 存下来，后续登录有了登录态就可以不用都登录了。

```
pnpm run juejin
```

### 配置 github-action（可选）

如果想实现签到成功后一条微信通知，就需要配置一下`yml`文件，在 /packages/workflows/signin.yml

> 这块的配置比较简单，就不配图了，大家应该随便搜下就能搜到如何配置 secrets

- 找到 `${{ secrets.PRIVATE_FANGTANG_KEY }}`

  推送是使用的方糖推送，如果没有注册一下就好了 [方糖 server](https://sct.ftqq.com/)

- 配置一下仓库的 secrets,key 为 PRIVATE_FANGTANG_KEY，值为自己方糖网站上对应的值

### 配置自动任务时间（可选）

看看`yml`文件中的 `cron` 配置，有详细的注释

### 推送至远程自己的 github

后续每日就会有自动任务来签到啦~在仓库的 action，微信方糖中即可查看

![image-20230930153413311](https://image.jimmyxuexue.top/img/202309301534346.png)

![image-20230930153554410](https://image.jimmyxuexue.top/img/202309301535443.png)

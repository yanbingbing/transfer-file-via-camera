# TransferFileViaCamera

## Step 1

在你的公司电脑上压缩你想传输的文件，最好改个名字，如 `MYBABY_PHOTO.JPG`

## Step 2

在你的公司电脑上 clone 该项目，安装好依赖（yarn|npm install）。

在 terminal 中启动 sen.js

```bash
node ./sen.js MYBABY_PHOTO.JPG
```

**调整好字体，使二维码完整显示。**

## Step 3

在你的个人电脑上 clone 该项目，同样安装好依赖，启动 rec.js

```bash
node ./rec.js
```

启动摄像头页面

```bash
npm start
```

摄像头启动后，点击 Start/Stop/Focus，然后让个人电脑摄像头对准公司电脑上的二维码，摄像头页面开始输出 READY 时，表示已经对准，**可以在公司电脑上的按回车**，开始传输。

## Step 4

第一轮传输结束时，难免有失败传输的帧，在个人电脑摄像头页面点击 info，查看丢掉的帧，拷贝发送到公司电脑上，在公司电脑上，选择 replay（输入 y 回车），将拷贝过来的需要重传的帧贴进去，并回车。

直到没有丢失的帧，我们可以点击 Write，写入文件 `all`，将这个文件改名 zip，解压缩就得到原始文件。

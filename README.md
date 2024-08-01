# Loafishing 浏览器摸鱼扩展
让网页中的图片、视频和背景图透明化，当鼠标移上去后恢复显示，或者在“画中画”窗口中显示。适用于 Google Chrome, Microsoft Edge, Opera 等 Chromium 内核的桌面浏览器。本浏览器扩展旨在让您在工作时安全地浏览 NSFW 的内容。

## 安装方法

打开浏览器的”**管理扩展程序**“页面，开启”**开发人员模式**“，点击”**加载已解压的扩展程序**“按钮，选择安装本项目下的 *loafishing* 文件夹。

也可以通过微软 Edge 应用商店进行安装：<https://microsoftedge.microsoft.com/addons/detail/nhnjhhjocnobohkgdpakocnfcipgnnak> 。

## 设置

点击浏览器扩展图标![icon](assets/icon.png)，可以在弹出窗口中进行设置。修改设置后需要手动刷新网页才能使设置生效。

![popup](assets/popup.png)

点击 ![shutdown](assets/shutdown.jpeg)可以打开或关闭扩展的功能。

在 **Target** 栏中勾选需要透明化的对象，包含图片、视频和背景图，默认全部勾选。

在 **Opacity** 栏中设置透明度，数字越小图像越淡。

在 **Filter** 栏中设置扩展应用的网站。有三种模式可供选择：

1. All ——应用所有网站
2. Include URLs ——仅应用于列表中的网站
3. Exclude URLs ——排除列表中的网站

网站列表中，每条匹配记录对应一行。匹配记录可以是完整的 URL ，也可以省略协议和路径，支持 <kbd>*</kbd> 通配符。匹配记录也可以是用 <kbd>/</kbd> 包裹的正则表达式。

下面的都是合法的匹配记录：

- x.com
- https://x.com
- *.youtube.com
- www.youtube.com/watch
- /www\\.youtube\\.com/

## 画中画功能

启用画中画后会在网页中出现一个悬浮窗口，当鼠标移动到透明化的图片或视频上时，图片或视频会在画中画中显示。画中画窗口中有三个按钮，作用分别如下：

- ![button-1](assets/button-1.png)在当前网页中开启或关闭画中画功能
- ![button-1](assets/button-2.png)在弹出窗口中使用画中画功能
- ![button-1](assets/button-3.png)在当前网页中关闭画中画窗口

## 快捷键

默认可使用 <kbd>Alt</kbd> + <kbd>Q</kbd> 来切换显示画中画窗口。进入 Set shortcut keys 页面可以为其他操作设置快捷键。

## 技巧

有时候图片或视频会被其他透明的 HTML 元素遮盖，虽然图片或视频在视口中可见，但是无法响应鼠标的 Hover 事件。可以在移动鼠标时按下 <kbd>Ctrl</kbd> 键，扩展会尝试找到被遮挡的图片或视频元素。

# 项目影片制作档案（待补齐）

本目录独立于网站，保留本地找到的 Remotion 源码与音频生成脚本。Composition 为 `WenyaStarmapLaunchFilm`，1920×1080、30fps、120秒。

**当前缺少** `public/remotion-video/wenya-starmap-launch-base.mp4` 和代码引用的 `public/remotion-audio/*.wav` 成品。脚本预期从 `out/wenya-starmap-launch.mp4` 复制此基础无声影片；本轮未在原项目引用路径找到它。直接 `npm run render` 将因缺少素材而失败，不把此档案标为可直接运行或可本地删除。

补齐自己有权公开且已检查隐私的基础影片后，在本目录执行 `npm install`、`npm run studio` 或 `npm run render`。Remotion 4.0.466/React18.3.1 使用独立依赖；本轮没有安装或重新渲染此子项目。制作代码与系统合成语音的使用范围仍需遵循各软件及语音引擎许可，见根目录第三方说明。

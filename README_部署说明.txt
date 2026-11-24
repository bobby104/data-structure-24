数据结构 24 题｜服务端编译修复版

修复原因：浏览器直接 fetch 第三方编译 API 时可能被 CORS 拦截。现在由同域 Netlify Function 服务端代理请求。

【部署方式 1：Netlify CLI（推荐）】
1. 电脑安装 Node.js。
2. 打开解压后的本文件夹，在终端运行：
   npx netlify-cli login
   npx netlify-cli deploy --build --prod
   首次部署时根据提示创建站点。
3. 打开生成的 https://xxx.netlify.app 网页。

【部署方式 2：Netlify Git 仓库持续部署】
1. 将整个文件夹上传到 GitHub 仓库。
2. 在 Netlify 导入 Git 仓库，使用仓库中的 netlify.toml 构建配置。
3. Netlify 构建后应发现函数 compile；访问网页测试。

重要：
- 仅双击 index.html 不可能执行后端 C 编译（file:// 无服务端）。
- 仅把 index.html 上传纯静态托管也不可以。
- Netlify Drop 的纯静态拖放部署不保证构建 Functions。请使用 Git 或 CLI。
- 即使正确部署，上游 Wandbox 故障时仍可能不能运行；此时可使用 OnlineGDB。
- 代码发送到 Wandbox 服务器运行，请勿输入隐私、密钥等内容。
- 只提供公开测试，不是 LeetCode 的完整隐藏评测。

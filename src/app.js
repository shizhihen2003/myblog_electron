// 引入所需的模块
const express = require('express'); // 引入 Express 框架，用于构建 Web 服务器
const path = require('path'); // 引入 path 模块，用于处理和转换文件路径
const mustache = require('mustache-express'); // 引入 Mustache 模板引擎
const router = require('./routes/blogRoutes'); // 引入自定义路由模块
const session = require('express-session'); // 引入 express-session 模块，用于管理会话
const auth = require('./auth/auth'); // 引入自定义认证模块
const passport = require('passport'); // 引入 Passport 模块，用于认证

// 创建 Express 应用实例
const app = express();

// 设置静态文件目录路径，public 是一个包含静态资源文件的目录
const public = path.join(__dirname, 'public');

// 设置静态文件目录，使得 public 目录下的文件可以通过 URL 直接访问
app.use(express.static(public));

// 使用 express.urlencoded 中间件来解析 URL 编码的请求体
// extended: false 表示使用经典的查询字符串库来解析数据
app.use(express.urlencoded({ extended: false }));

// 配置会话中间件
app.use(session({
    // secret 用于签名会话 ID 的秘密字符串，保证会话数据的安全
    secret: 'it is a secret',
    // resave: false 表示如果会话没有修改过，也不会重新保存会话
    resave: false,
    // saveUninitialized: false 表示如果新会话没有被修改过，也不会保存会话
    saveUninitialized: false
}));

// 初始化 Passport 中间件
app.use(passport.initialize()); // 初始化 Passport
app.use(passport.session()); // 使用 Passport 处理会话

// 初始化自定义认证模块，传入 app 实例
auth.init(app);

// 设置 Mustache 模板引擎
// 第一个参数 'mustache' 表示模板文件的扩展名
// 第二个参数 mustache() 是 Mustache 模板引擎的实例
app.engine('mustache', mustache());
app.set('view engine', 'mustache'); // 设置模板引擎为 Mustache
app.set('views', path.join(__dirname, 'views'));
// 使用自定义路由模块，处理根路径 '/' 的请求
app.use('/', router);

// 启动服务器，监听 3000 端口
app.listen(3000, () => {
    // 当服务器启动时在控制台输出消息
    console.log('服务器在3000端口执行，使用ctrl+c可以关闭服务器');
});

// 引入所需的模块
const express = require('express'); // 引入 Express 框架，用于构建 Web 服务器
const controller = require('../controllers/blogControllers'); // 引入博客控制器模块，处理各个路由请求
const { ensureLoggedIn } = require('connect-ensure-login'); // 引入 connect-ensure-login 模块，用于确保用户已登录
const auth = require('../auth/auth'); // 引入自定义认证模块
const router = express.Router(); // 创建一个新的路由对象

// 定义根路径的 GET 请求，使用 controller.main_page 处理请求
router.get('/', controller.main_page);

// 定义新博客页面的 GET 请求，确保用户已登录后，使用 controller.get_new_blog 处理请求
router.get('/newblog', ensureLoggedIn('/login'), controller.get_new_blog);

// 定义新博客页面的 POST 请求，使用 controller.post_new_blog 处理请求
router.post('/newblog', controller.post_new_blog);

// 定义用户博客页面的 GET 请求，使用 controller.show_user_blogs 处理请求
// :user 是 URL 参数，表示用户的名称或 ID
router.get('/user/:user', controller.show_user_blogs);

// 定义编辑博客页面的 GET 请求，确保用户已登录并且是博客的作者后，使用 controller.get_edit_blog 处理请求
router.get('/editblog/:id', ensureLoggedIn('/login'), controller.get_edit_blog);

// 定义编辑博客页面的 POST 请求，确保用户已登录并且是博客的作者后，使用 controller.post_edit_blog 处理请求
router.post('/editblog/:id', ensureLoggedIn('/login'), controller.post_edit_blog);

// 定义删除博客的 POST 请求，确保用户已登录并且是博客的作者后，使用 controller.delete_blog 处理请求
router.post('/deleteblog/:id', ensureLoggedIn('/login'), controller.delete_blog);

// 定义注册页面的 GET 请求，使用 controller.get_sign_up 处理请求
router.get('/signup', controller.get_sign_up);

// 定义注册页面的 POST 请求，使用 controller.post_sign_up 处理请求
router.post('/signup', controller.post_sign_up);

// 定义登录页面的 GET 请求，使用 controller.get_login 处理请求
router.get('/login', controller.get_login);

// 定义登录页面的 POST 请求，使用 auth.authorize('/login') 进行认证，然后使用 controller.post_login 处理请求
router.post('/login', auth.authorize('/login'), controller.post_login);

// 定义登出页面的 GET 请求，使用 controller.logout 处理请求
router.get('/logout', controller.logout);

// 定义'/about'的GET请求路由，请求由控制器层的about函数处理
router.get('/about', controller.about);

// 定义所有未匹配路由的处理函数，返回 404 页面，使用 controller.file_not_found 处理请求
router.use(controller.file_not_found);

// 定义服务器错误的处理函数，返回 500 页面，使用 controller.server_error 处理请求
router.use(controller.server_error);

// 导出路由对象，使其可以在其他模块中使用
module.exports = router;

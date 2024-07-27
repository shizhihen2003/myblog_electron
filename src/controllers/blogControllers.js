// 引入所需的模块和数据访问对象
const nedbDAO = require('../models/blogModels'); // 引入博客模型，用于操作博客数据
const db = new nedbDAO(); // 创建一个新的博客数据库实例
const path = require('path'); // 引入 path 模块，用于处理和转换文件路径
const userDAO = require('../models/userModel'); // 引入用户模型，用于操作用户数据
const auth = require('../auth/auth'); // 引入自定义认证模块

// 初始化博客数据库，插入测试数据
db.init();

/**
 * 处理主页面的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.main_page = function (req, res) {
    // 从数据库中获取所有博客数据
    db.getAllBlogs().then((list) => {

    /*遍历 list 中的每个 blog 对象，并创建一个新的对象。
    使用扩展运算符 ...blog 将 blog 对象中的所有属性和值复制到新的对象中。
    添加或覆盖新的属性 isAuthor。其值是一个布尔值，用于指示当前用户
    是否是该博客的作者 (req.user && blog.user === req.user.user)。*/
        // 将 isAuthor 添加到每个博客对象
        list = list.map(blog => ({
            // 展开 blog 对象的所有属性
            ...blog,
            // 添加新的属性 isAuthor，值为布尔值，表示当前用户是否是该博客的作者
            isAuthor: req.user && blog.user === req.user.user
        }));


        // 渲染 main_page 模板，将博客列表传递给模板进行显示
        res.render('main_page', {
            'title': '辰心的博客', // 页面标题
            'user': req.user, // 当前登录用户信息，从请求对象中获取
            'blogs': list // 博客列表，来自数据库查询结果
        });
    }).catch((error) => {
        // 如果数据库查询失败，返回 500 状态码和错误信息
        res.status(500).send("服务器内部错误");
        console.log('数据库查询失败', error); // 在控制台输出错误信息
    });
};

/**
 * 处理获取新博客页面的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.get_new_blog = function (req, res) {
    // 渲染 new_blog 模板，传递页面标题和用户信息
    res.render('new_blog', {
        'title': '辰心的博客', // 页面标题
        'user': req.user, // 当前登录用户信息，从请求对象中获取
        'username': req.user.user // 用户名，从用户信息中获取
    });
};

/**
 * 处理提交新博客的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息和表单数据
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.post_new_blog = (req, res) => {
    // 检查请求体中是否包含 user 字段
    if (!req.body.user) {
        res.status(400).send('博文需要一个作者！'); // 如果没有提供作者信息，返回 400 状态码和错误信息
        return;
    }
    // 添加新博客到数据库
    db.addBlog(req.body.user, req.body.topic, req.body.message);
    // 重定向到主页面
    res.redirect('/');
};

/**
 * 处理显示用户博客的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息和 URL 参数
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.show_user_blogs = (req, res) => {
    // 获取 URL 参数中的用户名
    let user = req.params.user;
    console.log('req.params.user:', user); // 输出获取的用户名以便调试
    // 根据用户名从数据库中获取博客数据
    db.getBlogsByUser(user).then((list) => {
        // 将 isAuthor 添加到每个博客对象
        list = list.map(blog => ({
            ...blog,
            isAuthor: req.user && blog.user === req.user.user
        }));
        // 渲染 main_page 模板，将用户的博客列表传递给模板进行显示
        res.render('main_page', {
            'title': '辰心的博客', // 页面标题
            'user': req.user, // 当前登录用户信息，从请求对象中获取
            'blogs': list // 博客列表，来自数据库查询结果
        });
    }).catch((error) => {
        // 如果数据库查询失败，返回 500 状态码和错误信息
        res.status(500).send("服务器内部错误");
        console.log('数据库查询失败', error); // 在控制台输出错误信息
    });
};

// 处理获取编辑博客页面的请求
exports.get_edit_blog = (req, res) => {
    const blogId = req.params.id; // 获取请求参数中的博客ID
    db.getBlogById(blogId).then((blog) => { // 从数据库中获取对应ID的博客信息
        // 检查博客是否存在且当前用户是否为博客的作者
        if (!blog || blog.user !== req.user.user) {
            res.status(403).send('你没有权限编辑此博客！'); // 如果用户不是博客的作者，返回403错误
            return;
        }
        res.render('edit_blog', { // 渲染编辑博客页面
            'title': '编辑博客', // 页面标题
            'user': req.user, // 当前登录用户信息
            'blog': blog // 博客信息
        });
    }).catch((error) => {
        res.status(500).send("服务器内部错误"); // 如果数据库查询失败，返回500错误
        console.log('数据库查询失败', error); // 在控制台输出错误信息
    });
};

// 处理提交编辑博客的请求
exports.post_edit_blog = (req, res) => {
    const blogId = req.params.id; // 获取请求参数中的博客ID
    // 检查请求体中的所有字段是否填满
    if (!req.body.user || !req.body.topic || !req.body.message) {
        res.status(400).send('所有字段都是必填的！'); // 如果有字段未填，返回400错误
        return;
    }
    db.getBlogById(blogId).then((blog) => { // 从数据库中获取对应ID的博客信息
        // 检查博客是否存在且当前用户是否为博客的作者
        if (!blog || blog.user !== req.user.user) {
            res.status(403).send('你没有权限编辑此博客！'); // 如果用户不是博客的作者，返回403错误
            return;
        }
        // 更新数据库中的博客信息
        db.updateBlog(blogId, req.body.user, req.body.topic, req.body.message).then(() => {
            res.redirect('/'); // 更新成功后重定向到主页
        }).catch((error) => {
            res.status(500).send("服务器内部错误"); // 如果数据库更新失败，返回500错误
            console.log('数据库更新失败', error); // 在控制台输出错误信息
        });
    }).catch((error) => {
        res.status(500).send("服务器内部错误"); // 如果数据库查询失败，返回500错误
        console.log('数据库查询失败', error); // 在控制台输出错误信息
    });
};

// 处理删除博客的请求
exports.delete_blog = (req, res) => {
    const blogId = req.params.id; // 获取请求参数中的博客ID
    db.getBlogById(blogId).then((blog) => { // 从数据库中获取对应ID的博客信息
        // 检查博客是否存在且当前用户是否为博客的作者
        if (!blog || blog.user !== req.user.user) {
            res.status(403).send('你没有权限删除此博客！'); // 如果用户不是博客的作者，返回403错误
            return;
        }
        db.deleteBlog(blogId).then(() => { // 从数据库中删除对应ID的博客
            res.redirect('/'); // 删除成功后重定向到主页
        }).catch((error) => {
            res.status(500).send("服务器内部错误"); // 如果数据库删除失败，返回500错误
            console.log('数据库删除失败', error); // 在控制台输出错误信息
        });
    }).catch((error) => {
        res.status(500).send("服务器内部错误"); // 如果数据库查询失败，返回500错误
        console.log('数据库查询失败', error); // 在控制台输出错误信息
    });
};



/**
 * 处理获取注册页面的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.get_sign_up = (req, res) => {
    // 渲染 user/signup 模板，显示注册页面
    res.render('./user/signup');
};

/**
 * 处理提交注册的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息和表单数据
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.post_sign_up = (req, res) => {
    // 获取请求体中的用户名和密码
    const username = req.body.user;
    const password = req.body.pass;
    // 检查用户名和密码是否为空
    if (!username || !password) {
        res.send(401, "用户名或密码不能为空！"); // 如果用户名或密码为空，返回 401 状态码和错误信息
        return;
    }
    // 查找用户名是否已经存在
    userDAO.lookup(username, function (err, user) {
        if (user) {
            res.send(401, "用户已经存在：", user); // 如果用户已存在，返回 401 状态码和错误信息
            return;
        }
        // 创建新用户
        userDAO.create(username, password);
        // 重定向到登录页面
        res.redirect('/login');
    });
};

/**
 * 处理获取登录页面的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.get_login = (req, res) => {
    // 渲染 user/login 模板，显示登录页面
    res.render('./user/login');
};

/**
 * 处理提交登录的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息和表单数据
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.post_login = (req, res) => {
    // 登录成功后重定向到主页面
    res.redirect('/');
};

/**
 * 处理登出的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.logout = (req, res) => {
    // 执行登出操作
    req.logout((err) => {
        if (err) {
            return next(err); // 如果登出过程中发生错误，调用 next(err) 处理错误
        }
        // 登出成功后重定向到主页面
        res.redirect('/');
    });
};

// 导出about函数，用于处理关于页面的请求
exports.about = (req, res) => {
    // 发送about.html文件
    res.sendFile(path.resolve('', 'public/about.html'));  // 使用path.resolve来确保路径正确

    // 输出当前目录和上级目录的绝对路径，用于调试
    console.log(path.resolve(''));   // 输出当前执行脚本所在的目录
    console.log(path.resolve('.'));  // 输出当前工作目录
    console.log(path.resolve('..')); // 输出当前目录的父目录
}

/**
 * 处理未找到页面的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.file_not_found = (req, res) => {
    res.type('text/plain'); // 设置响应内容类型为纯文本
    res.status(404).send("404 哎呀，网页不见啦～"); // 返回 404 状态码和错误信息
};

/**
 * 处理服务器内部错误的请求
 * @param {Object} req - 请求对象，包含 HTTP 请求信息
 * @param {Object} res - 响应对象，用于发送 HTTP 响应
 */
exports.server_error = (req, res) => {
    res.type('text/plain'); // 设置响应内容类型为纯文本
    res.status(500).send("500 服务器内部错误~"); // 返回 500 状态码和错误信息
};


// 引入所需的模块和数据模型
const passport = require('passport'); // 引入 Passport 库，用于用户认证
const Strategy = require('passport-local').Strategy; // 引入 Passport 的本地策略，用于用户名和密码认证
const userModel = require('../models/userModel.js'); // 引入用户模型，用于查找用户数据
const bcrypt = require('bcryptjs'); // 引入 bcrypt 库，用于加密和验证密码

/**
 * 初始化 Passport 认证配置
 * @param {object} app - Express 应用实例
 */
exports.init = function (app) {
    // 配置 Passport 使用本地策略
    passport.use(new Strategy(
        /**
         * 验证函数，用于验证用户名和密码
         * @param {string} username - 用户名
         * @param {string} password - 密码
         * @param {function} cb - 回调函数，接受错误对象和用户对象作为参数
         */
        function (username, password, cb) {
            // 查找用户
            userModel.lookup(username, function (err, user) {
                console.log('lookup user', username);
                if (err) {
                    console.log('error looking up user', err);
                    return cb(err); // 如果查找用户时发生错误，调用回调函数并传递错误对象
                }
                if (!user) {
                    console.log('user ', username, ' not found');
                    return cb(null, false); // 如果用户不存在，调用回调函数并传递 false 表示认证失败
                }
                // 比较提供的密码和数据库中的加密密码
                bcrypt.compare(password, user.password,
                    /**
                     * 密码比较回调函数
                     * @param {object} err - 错误对象
                     * @param {boolean} result - 密码比较结果，true 表示匹配，false 表示不匹配
                     */
                    function (err, result) {
                        if (result) {
                            cb(null, user); // 如果密码匹配，调用回调函数并传递用户对象
                        } else {
                            cb(null, false); // 如果密码不匹配，调用回调函数并传递 false 表示认证失败
                        }
                    });
            });
        }
    ));

    /**
     * 序列化用户对象
     * @param {object} user - 用户对象
     * @param {function} cb - 回调函数，接受错误对象和用户 ID 作为参数
     */
    passport.serializeUser(function (user, cb) {
        cb(null, user.user); // 序列化用户对象，将用户的用户名存储在会话中
    });

    /**
     * 反序列化用户对象
     * @param {string} id - 用户 ID
     * @param {function} cb - 回调函数，接受错误对象和用户对象作为参数
     */
    passport.deserializeUser(function (id, cb) {
        userModel.lookup(id, function (err, user) {
            if (err) {
                return cb(err); // 如果查找用户时发生错误，调用回调函数并传递错误对象
            }
            cb(null, user); // 反序列化用户对象，通过用户名查找用户并传递给回调函数
        });
    });

    // 将 Passport 初始化中间件和会话中间件添加到 Express 应用中
    app.use(passport.initialize()); // 初始化 Passport 中间件
    app.use(passport.session()); // 使用 Passport 管理会话
};

/**
 * 授权中间件，用于保护路由
 * @param {string} redirect - 认证失败时的重定向 URL
 * @returns {function} - Passport 认证中间件
 */
exports.authorize = function (redirect) {
    return passport.authenticate('local', {
        failureRedirect: redirect // 如果认证失败，重定向到指定的 URL
    });
};

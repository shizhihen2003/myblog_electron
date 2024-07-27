const Datastore = require("nedb"); // 引入 NeDB 库，用于数据存储
const bcrypt = require('bcryptjs'); // 引入 bcrypt 库，用于加密和验证密码
const saltRounds = 10; // bcrypt 加盐的轮数

/**
 * 用户数据访问对象（DAO）类
 */
class UserDAO {
    /**
     * 构造函数，初始化数据库
     * @param {string} [dbFilePath] - 数据库文件路径，如果未提供，则使用内存数据库
     */
    constructor(dbFilePath) {
        if (dbFilePath) {
            // 使用嵌入式数据库
            this.db = new Datastore({
                filename: dbFilePath,
                autoload: true // 自动加载数据库文件
            });
        } else {
            // 使用内存数据库
            this.db = new Datastore();
        }
    }

    /**
     * 初始化数据库，插入示例用户数据
     * @returns {UserDAO} 返回当前 UserDAO 实例
     */
    init() {
        // 插入示例用户 'Peter'
        this.db.insert({
            user: 'Peter',
            password: '$2b$10$I82WRFuGghOMjtu3LLZW9OAMrmYOlMZjEEkh.vx.K2MM05iu5hY2C'
        });
        // 插入示例用户 'Ann'
        this.db.insert({
            user: 'Ann',
            password: '$2b$10$bnEYkqZM.MhEF/LycycymOeVwkQONq8kuAUGx6G5tF9UtUcaYDs3S'
        });
        return this;
    }

    /**
     * 创建新用户
     * @param {string} username - 用户名
     * @param {string} password - 密码
     */
    create(username, password) {
        const that = this; // 保存当前对象的引用以供回调函数使用
        // 使用 bcrypt 加密密码
        bcrypt.hash(password, saltRounds).then(function (hash) {
            var entry = {
                user: username,
                password: hash, // 存储加密后的密码
            };
            // 将新用户插入数据库
            that.db.insert(entry, function (err) {
                if (err) {
                    console.log("Can't insert user: ", username); // 如果插入失败，输出错误信息
                }
            });
        });
    }

    /**
     * 查找用户
     * @param {string} user - 用户名
     * @param {function} cb - 回调函数，接受错误对象和用户对象作为参数
     */
    lookup(user, cb) {
        // 在数据库中查找用户
        this.db.find({ 'user': user }, function (err, entries) {
            if (err) {
                return cb(null, null); // 如果查找时发生错误，调用回调函数并传递 null
            } else {
                if (entries.length == 0) {
                    return cb(null, null); // 如果未找到用户，调用回调函数并传递 null
                }
                return cb(null, entries[0]); // 如果找到用户，调用回调函数并传递用户对象
            }
        });
    }
}

// 创建 UserDAO 实例并初始化数据库
const dao = new UserDAO();
dao.init();
module.exports = dao; // 导出 UserDAO 实例供其他模块使用

// 引入 nedb 模块，用于创建和操作 NeDB 数据库
const nedb = require('nedb');
const date = require("date-and-time");


class Blog {
    /**
     * 构造函数，用于初始化 Blog 类的实例
     * @param {string} dbFilePath - 数据库文件的路径
     */
    constructor(dbFilePath) {
        // 如果提供了数据库文件路径，则使用该路径创建并加载数据库
        if (dbFilePath) {
            this.db = new nedb({ filename: dbFilePath, autoload: true });
        } else {
            // 否则，创建一个内存中的数据库
            this.db = new nedb();
        }
    }

    /**
     * 初始化数据库，插入一些测试数据
     */
    init() {
        // 插入第一条测试数据
        this.db.insert({
            'topic': '测试数据1', // 博客主题
            'message': '测试内容1', // 博客内容
            'user': '辰心', // 用户名
            'time': '2024-06-16 16:16' // 时间戳
        });
        // 插入第二条测试数据
        this.db.insert({
            'topic': '测试数据2', // 博客主题
            'message': '测试内容2', // 博客内容
            'user': '辰心', // 用户名
            'time': '2024-06-16 16:16' // 时间戳
        });
    }

    /**
     * 获取所有博客数据
     * @returns {Promise} - 返回包含所有博客数据的 Promise 对象
     */
    getAllBlogs() {
        // 返回一个新的 Promise 对象
        return new Promise((resolve, reject) => {
            // 查询所有博客数据
            this.db.find({}, (err, docs) => {
                if (err) {
                    // 如果查询出错，拒绝 Promise 并输出错误信息
                    reject(err);
                    console.log('数据查询出错~');
                } else {
                    // 如果查询成功，解析 Promise 并输出查询到的数据
                    resolve(docs);
                    console.log('查询到的数据为：', docs);
                }
            });
        });
    }

    /**
     * 根据用户获取博客数据
     * @param {string} user - 用户名
     * @returns {Promise} - 返回包含该用户所有博客数据的 Promise 对象
     */
    getBlogsByUser(user) {
        // 返回一个新的 Promise 对象
        return new Promise((resolve, reject) => {
            // 根据用户名查询博客数据
            this.db.find({ 'user': user }, (err, docs) => {
                if (err) {
                    // 如果查询出错，拒绝 Promise 并输出错误信息
                    reject(err);
                    console.log('数据查询出错~');
                } else {
                    // 如果查询成功，解析 Promise 并输出查询到的数据
                    resolve(docs);
                    console.log('查询到的数据为：', docs);
                }
            });
        });
    }

    /**
     * 添加新的博客
     * @param {string} user - 用户名
     * @param {string} topic - 博客主题
     * @param {string} message - 博客内容
     */
    addBlog(user, topic, message) {
        // 创建一个包含博客信息的对象
        var blog = {
            user: user, // 用户名
            topic: topic, // 博客主题
            message: message, // 博客内容
            // time: new Date().toISOString().split('T')[0] // 设置当前日期为时间戳，格式为 YYYY-MM-DD
            
            // 使用 date-and-time 库格式化当前日期和时间，格式为 YYYY-MM-DD HH:mm（外教课）
            time: date.format(new Date(),'YYYY-MM-DD HH:mm')
        };

        // 插入新博客数据
        this.db.insert(blog, (err, docs) => {
            if (err) {
                // 如果插入出错，输出错误信息
                console.log('插入失败', err);
            } else {
                // 如果插入成功，输出插入的数据
                console.log('插入成功', docs);
            }
        });
    }

    /**
     * 根据博客 ID 获取博客数据
     * @param {string} id - 博客 ID
     * @returns {Promise} - 返回包含博客数据的 Promise 对象
     */
    getBlogById(id) {
        return new Promise((resolve, reject) => {
            // 使用 NeDB 的 findOne 方法从数据库中查找具有指定 _id 的博客
            this.db.findOne({ _id: id }, (err, doc) => {
                if (err) {
                    // 如果查询过程中发生错误，则拒绝 Promise 并传递错误信息
                    reject(err);
                } else {
                    // 如果查询成功，则解析 Promise 并传递查询到的博客数据
                    resolve(doc);
                }
            });
        });
    }

    /**
     * 更新博客数据
     * @param {string} id - 博客 ID
     * @param {string} user - 用户名
     * @param {string} topic - 博客主题
     * @param {string} message - 博客内容
     * @returns {Promise} - 返回更新结果的 Promise 对象
     */
    updateBlog(id, user, topic, message) {
        return new Promise((resolve, reject) => {
            // 使用 NeDB 的 update 方法更新具有指定 _id 的博客数据
            this.db.update({ _id: id }, { $set: { user, topic, message } }, {}, (err, numReplaced) => {
                if (err) {
                    // 如果更新过程中发生错误，则拒绝 Promise 并传递错误信息
                    reject(err);
                } else {
                    // 如果更新成功，则解析 Promise 并传递更新操作影响的文档数量
                    resolve(numReplaced);
                }
            });
        });
    }

    /**
     * 删除博客数据
     * @param {string} id - 博客 ID
     * @returns {Promise} - 返回删除结果的 Promise 对象
     */
    deleteBlog(id) {
        return new Promise((resolve, reject) => {
            // 使用 NeDB 的 remove 方法删除具有指定 _id 的博客数据
            this.db.remove({ _id: id }, {}, (err, numRemoved) => {
                if (err) {
                    // 如果删除过程中发生错误，则拒绝 Promise 并传递错误信息
                    reject(err);
                } else {
                    // 如果删除成功，则解析 Promise 并传递删除操作影响的文档数量
                    resolve(numRemoved);
                }
            });
        });
    }

}

// 导出 Blog 类，使其可以在其他模块中使用
module.exports = Blog;

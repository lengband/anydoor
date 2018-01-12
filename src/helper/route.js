const fs = require('fs')
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const path = require('path')
const readdir = promisify(fs.readdir)
const mime = require('./mime')
const compress = require('./compress')
const range = require('./range')
const isFresh = require('./cache')
const Handlebars = require('handlebars') // 模板引擎 -> handlebars

// * 除了require里面的参数是可以随意写相对路径，剩下的像readFile这种路径建议写成绝对路径, 因为启动的路径不一样可能出问题
const tplPath = path.join(__dirname, '../template/dir.tpl')
// * 用同步有两点原因: 1、后面的函数执行值依赖这个文件  2、可以缓存模板，只执行一次(是因为这个文件一旦被require一次后会被缓存, 所以当请求进来是，被反复触发的只是下面的函数)
const source = fs.readFileSync(tplPath)
const template = Handlebars.compile(source.toString())

module.exports = async function (req, res, filePath, config) {
    try {
        const stats = await stat(filePath)
        if (stats.isFile()) {
            const contentType = mime(filePath)
            res.setHeader('Content-Type', contentType)
            if (isFresh(stats, req, res)) {
                res.statusCode = 304
                res.end()
                return
            }
            let rs
            const {code, start, end} = range(stats.size, req, res)
            if (code === 200) {
                res.statusCode = 200
                rs = fs.createReadStream(filePath)
            } else {
                res.statusCode = 206 // * 返回部分内容
                rs = fs.createReadStream(filePath, {start, end}) // * 读range范围内的流
            }
            if (filePath.match(config.compress)) {
                rs = compress(rs, req, res) // ??? 压缩完事649b, 压缩前是625b, 为什么
            }
            rs.pipe(res)
            // low的方法
            // fs.readFile(filePath, (err, data) => {
            //     res.end(data)
            // })
            // fs.createReadStream(filePath).pipe(res) // 通过流的形式一点一点返回客户端
        } else if (stats.isDirectory()) {
            const files = await readdir(filePath)
            res.setHeader('Content-type', 'text/html')
            res.statusCode = 200
            const dir = path.relative(config.root, filePath)
            const data = {
                title: path.basename(filePath),
                dir: dir ? `/${dir}` : '',
                files: files.map(file => {
                    return {
                        file,
                        icon: mime(file)
                    }
                })
            }
            res.end(template(data))
        }
    } catch (error) {
        res.setHeader('Content-type', 'text/plain')
        res.statusCode = 200
        res.end(`${filePath} is not a directory or file ${error}`)
    }
}

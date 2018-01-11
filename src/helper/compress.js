// zlib模块能创建压缩
const {createGzip, createDeflate} = require('zlib')
// rs readstream  知道客户端的压缩类型  告诉客户端的压缩类型
module.exports = (rs, req, res) => {
    const acceptEncoding = req.headers['accept-encoding']
    // 不支持gzip5 所以写死 \b单词边界
    if(!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)){
        return rs
    }else if(acceptEncoding.match(/\bgzip\b/)){
        res.setHeader('Content-Encoding', 'gzip')
        return rs.pipe(createGzip())
    }else if(acceptEncoding.match(/\bdeflate\b/)){
        res.setHeader('Content-Encoding', 'deflate')
        return rs.pipe(createDeflate())
    }
}
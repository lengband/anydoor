const { exec } = require('child_process')

module.exports = url => {
    switch (process.platform) {
        case 'darwin': // mac
            exec(`open ${url}`)
            break
        case 'win32': // win
            exec(`start ${url}`)
            break
    }
}
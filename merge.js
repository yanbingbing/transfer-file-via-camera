var fs = require('fs/promises')


async function merge() {
  const contents = await fs.readFile('./base64', 'utf8')
  

  fs.writeFile('./all2', contents.split('\n').join(''), {
    encoding: 'base64'
  })
}

merge()
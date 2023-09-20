#!/usr/bin/env node

const qrDecode = require('qr-decode/server');
const fs = require('fs/promises')
const express = require('express');
const { decode } = require('base64-arraybuffer');
const app = express()

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
app.use(express.text({
  limit: '50mb'
}))

let totalFrames = 0
let leftFrames = 0
let frameWidth = 6

const fileContentsArray = new Array(totalFrames)

app.post('/', async (req, res) => {
  if (leftFrames <= 0 && totalFrames !== 0) {
    res.send(`Over Already!`)
    return 
  }
  const body = req.body.replace('data:image/png;base64,', '')
  const buf = await decode(body)
  try {
    const code = await qrDecode.decodeByBuffer(buf)
    if (code.slice(0, 6) === 'START:') {
      const info = code.slice(6).split(' ')
      frameWidth = parseInt(info[0])
      totalFrames = parseInt(info[1])
      leftFrames = totalFrames
      res.send(`READY`)
    } else {
      const index = parseInt(code.slice(0, frameWidth).trim(), 36)
      if (!isNaN(index) && index > -1 && index < totalFrames && fileContentsArray[index] == null) {
        fileContentsArray[index] = code.slice(frameWidth)
        leftFrames--;
        const p = (totalFrames - leftFrames) / totalFrames
        console.info(p)
        res.send(`REC ${index} progress: ${p}`)
      } else {
        res.send(`OK`)
      }
    }
  } catch (e) {
    res.send('ERR')
  }
})

app.post('/info', (req, res) => {
  const emptyslots = []
  for (let i = 0; i < totalFrames; i++) {
    if (fileContentsArray[i] == null) {
      emptyslots.push(i)
    }
  }
  res.send(emptyslots.join(','))
})

app.post('/write', async (req, res) => {
  await writeAll()
  res.send(`Write OK`)
})
app.post('/cache', async (req, res) => {
  await write64()
  res.send(`Cache OK`)
})

app.listen(3030)
console.info('listen ok')


function writeAll() {
  return fs.writeFile('./all', fileContentsArray.join(''), {
    encoding: 'base64'
  })
}

function write64() {
  return fs.writeFile('./base64', fileContentsArray.join('\n'))
}
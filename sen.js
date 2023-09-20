#!/usr/bin/env node

const qrcode = require('qrcode')
const strpad = require('strpad')
const fs = require('fs')
const readline = require('readline');

const filePath = process.argv[2]

if (!filePath) {
    console.error('Please specify the file path')
    process.exit(1)
}

const buffer = fs.readFileSync(filePath, { encoding: 'base64' })
const max = buffer.length
const frameWidth = 6

let i = 0
let slots = []

function getSlotIndex() {
    if (i < slots.length) {
        return slots[i]
    }

    return -1
}

const capacity = 250
const total = Math.ceil(max / capacity)
function getSerialIndex() {
    if (i < total) {
        return i
    }
    return -1
}
const duration = 100

function play() {
    const index = getSerialIndex()
    if (index < 0) {
        shouldReplay()
        return
    }
    const start = index * capacity
    const end = Math.min((index + 1) * capacity, max)
    const buf = buffer.slice(start, end)

    qrcode.toString(
        strpad.right(index.toString(36), frameWidth) + buf,
        { type: 'terminal' },
        (err, url) => {
            console.clear()
            console.info(index)
            console.info(url)
            i++
            setTimeout(play, duration)
        }
    )
}

function replay() {
    const index = getSlotIndex()
    if (index < 0) {
        shouldReplay()
        return
    }
    const start = index * capacity
    const end = Math.min((index + 1) * capacity, max)
    const buf = buffer.slice(start, end)

    qrcode.toString(
        strpad.right(index.toString(36), frameWidth) + buf,
        { type: 'terminal' },
        (err, url) => {
            console.clear()
            console.info(index)
            console.info(url)
            i++
            setTimeout(replay, duration)
        }
    )
}

function outputFileInfoCode() {
    qrcode.toString(
        `START:${frameWidth} ${total} `+ buffer.slice(0, 240),
        { type: 'terminal' },
        (err, url) => {
            console.clear()
            console.info('s')
            console.info(url)
        }
    )
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
readline.clearScreenDown(process.stdout)

outputFileInfoCode()

rl.question('If you ready press enter to go.', () => {
    play()
});

function shouldReplay() {
    readline.clearScreenDown(process.stdout)
    rl.question('Should replay? [N/y]', (a) => {
        if (a === 'y' || a === 'Y') {
            setSlotsAndReplay()
        } else {
            rl.close();
        }
    });
}

function setSlotsAndReplay() {
    rl.question('Please input the replay slots:', (a) => {
        slots = a.split(/ *[, ] *]/).map((s) => parseInt(s))
        i = 0
        replay()
    });
}
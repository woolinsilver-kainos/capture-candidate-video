/* global $ alert Blob File ffmpeg_run FileReader MediaRecorder saveAs */

let file

enableStartButton()
disableDownloadButton()

function enableStartButton () {
  $('#start')
    .prop('disabled', false)
    .removeClass('disabled')
    .on('click', start)
}

function enableDownloadButton () {
  $('#download')
    .prop('disabled', false)
    .removeClass('disabled')
    .on('click', download)
}

function disableStartButton () {
  $('#start')
    .prop('disabled', true)
    .addClass('disabled')
    .off('click')
}

function disableDownloadButton () {
  $('#download')
    .prop('disabled', true)
    .addClass('disabled')
    .off('click')
}

function error (error) {
  console.error(error)
  alert('Error! See console.')
}

/**
 * @returns Promise<MediaStream>
 */
function getMediaStream () {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1280,
      height: 720,
      facingMode: 'user'
    }
  })
}

/**
 * @param stream {MediaStream}
 * @returns Promise<MediaStream>
 */
function preview (stream) {
  return new Promise((resolve, reject) => {
    const video = document.querySelector('video')
    video.srcObject = stream
    video.onloadedmetadata = () => {
      video.play()
        .then(() => { resolve(stream) })
        .catch(reject)
    }
  })
}

function pause () {
  const video = document.querySelector('video')
  video.pause()
  video.srcObject = null
}

function record (stream) {
  return new Promise((resolve) => {
    // hold each chunk of video data in memory
    let chunks = []
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=h264'
    })
    recorder.ondataavailable = event => {
      chunks.push(event.data)
    }
    recorder.onstop = () => {
      pause()
      resolve(new Blob(chunks, {'type': 'video/webm'}))
    }
    recorder.start()
    setTimeout(() => {
      recorder.stop()
    }, 3000)
  })
}

/**
 * @param blob {Blob}
 * @returns Promise<ArrayBuffer>
 */
function asArrayBuffer (blob) {
  return new Promise(resolve => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      resolve(fileReader.result)
    }
    fileReader.readAsArrayBuffer(blob)
  })
}

/**
 *
 * @param blob {Blob}
 * @returns Promise<File>
 */
function convert (blob) {
  // influenced by:
  // https://raw.githubusercontent.com/muaz-khan/Ffmpeg.js/master/webm-to-mp4.html

  return asArrayBuffer(blob)
    .then((buffer) => {
      const result = ffmpeg_run({
        arguments: '-i video.webm video.mp4'.split(' '),
        files: [{data: new Uint8Array(buffer), name: 'video.webm'}],
        TOTAL_MEMORY: 268435456 // 256 MiB
      })
      file = new File([result[0].data], 'video.mp4', {
        type: 'video/mp4'
      })
      enableDownloadButton()
    })
}

function download () {
  saveAs(file)
}

function start () { // eslint-disable-line no-unused-vars
  disableStartButton()
  getMediaStream()
    .then(preview)
    .then(record)
    .then(convert)
    .catch(error)
}

/* global $ alert Blob File ffmpeg_run FileReader MediaRecorder saveAs */

const state = {

  /**
   * MediaStream of webcam
   */
  stream: null,

  /**
   * Recorded WebM/H.264
   */
  blob: null,

  /**
   * Transcoded MPEG-4/H.264
   */
  file: null

}

/**
 * Enable button in user interface.
 */
function enable (button, handler) {
  $(button)
    .prop('disabled', false)
    .removeClass('disabled')
    .on('click', handler)
}

/**
 * Disable button in user interface.
 */
function disable (button) {
  $(button)
    .prop('disabled', true)
    .addClass('disabled')
    .off('click')
}

/**
 * Crude!
 */
function errorHandler (error) {
  console.error(error)
  alert('An error has occurred! See console for more information.')
}

/**
 * @returns Promise<MediaStream>
 */
function createMediaStream () {
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
 * @param stream {MediaStream|null}
 * @returns Promise<void>
 */
function preview (stream) {
  return new Promise((resolve, reject) => {
    const video = document.querySelector('video')
    if (stream) {
      // enable preview
      video.srcObject = stream
      video.onloadedmetadata = () => {
        video.play()
          .then(resolve)
          .catch(reject)
      }
    } else {
      // disable preview
      video.pause()
      video.srcObject = null
      resolve()
    }
  })
}

/**
 *
 * @param stream
 * @return {Promise<any>}
 */
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
      resolve(new Blob(chunks, {'type': 'video/webm'}))
    }
    recorder.start()
    setTimeout(() => {
      recorder.stop()
    }, 5000)
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
function transcode (blob) {
  // influenced by:
  // https://raw.githubusercontent.com/muaz-khan/Ffmpeg.js/master/webm-to-mp4.html
  return asArrayBuffer(blob)
    .then((buffer) => {
      const output = ffmpeg_run({
        arguments: '-i video.webm video.mp4'.split(' '),
        files: [{data: new Uint8Array(buffer), name: 'video.webm'}],
        TOTAL_MEMORY: 268435456 // 256 MiB
      })
      return new File([output[0].data], 'video.mp4', {
        type: 'video/mp4'
      })
    })
}

enable('#preview', previewButtonClicked)
disable('#record')
disable('#transcode')
disable('#download')

function previewButtonClicked () {
  disable('#preview')
  createMediaStream()
    .then((stream) => {
      state.stream = stream
      return preview(stream)
    })
    .then(() => { enable('#record', recordButtonClicked) })
    .catch(errorHandler)
}

function recordButtonClicked () {
  disable('#record')
  record(state.stream)
    .then((blob) => {
      state.blob = blob
    })
    .then(() => {
      preview(null)
      enable('#transcode', transcodeButtonClicked)
    })
    .catch(errorHandler)
}

function transcodeButtonClicked () {
  disable('#transcode')
  transcode(state.blob)
    .then((file) => {
      state.file = file
      enable('#download', downloadButtonClicked)
    })
}

function downloadButtonClicked () {
  disable('#download')
  saveAs(state.file)
}

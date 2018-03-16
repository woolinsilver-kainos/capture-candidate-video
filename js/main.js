/* global $ alert Blob File MediaRecorder saveAs */

const state = {

  /**
   * MediaStream of webcam
   */
  stream: null,

  /**
   * Recorded WebM/H.264
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
 * @param enable {boolean}
 * @returns Promise<void>
 */
function preview (enable) {
  return new Promise((resolve, reject) => {
    const video = document.querySelector('video')
    if (enable) {
      video.srcObject = state.stream
      video.onloadedmetadata = () => {
        video.play()
          .then(resolve)
          .catch(reject)
      }
    } else {
      video.pause()
      video.srcObject = null
      state.stream.getTracks()[0].stop()
      resolve()
    }
  })
}

/**
 *
 * @param stream
 * @return {Promise<Blob>}
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

enable('#preview', previewButtonClicked)
disable('#record')
disable('#download')

function previewButtonClicked () {
  disable('#preview')
  createMediaStream()
    .then((stream) => {
      state.stream = stream
      return preview(true)
    })
    .then(() => { enable('#record', recordButtonClicked) })
    .catch(errorHandler)
}

function recordButtonClicked () {
  disable('#record')
  record(state.stream)
    .then((blob) => {
      state.file = new File([blob], 'candidate.webm', {type: 'video/webm'})
    })
    .then(() => {
      enable('#download', downloadButtonClicked)
      return preview(false)
    })
    .catch(errorHandler)
}

function downloadButtonClicked () {
  disable('#download')
  saveAs(state.file)
}

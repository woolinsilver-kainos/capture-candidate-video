/* global Blob File getVideoElement MediaRecorder saveAs */

/**
 * @returns Promise<void>
 */
function createStream () {
  return enableWebcam()
    .then(startPreview)
}

/**
 * @returns Promise<void>
 */
function recordStream () {
  return record()
    .then(stopPreview)
    .then(disableWebcam)
}

/**
 * @return {Promise<void>}
 */
function downloadVideo () {
  return new Promise(resolve => {
    saveAs(state.file)
    resolve()
  })
}

// ////////////////////////////////////////////////////////////////////////////

const state = {

  /**
   * @type {MediaStream}
   */
  stream: null,

  /**
   * @type {Blob}
   */
  blob: null,

  /**
   * @type {File}
   */
  file: null

}

/**
 * @return {Promise<MediaStream>}
 */
function enableWebcam () {
  /**
   * @type {MediaStreamConstraints}
   */
  const constraints = {
    audio: false,
    video: {
      width: 1280,
      height: 720,
      facingMode: 'user'
    }
  }
  return navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => { state.stream = stream })
}

/**
 * @returns Promise<void>
 */
function startPreview () {
  return new Promise((resolve, reject) => {
    const video = getVideoElement()
    video.srcObject = state.stream
    video.onloadedmetadata = () => {
      video.play()
        .then(resolve)
        .catch(reject)
    }
  })
}

/**
 * @returns {void}
 */
function stopPreview () {
  const video = getVideoElement()
  video.pause()
  video.srcObject = null
}

function disableWebcam () {
  state.stream.getTracks()[0].stop()
  state.stream = null
}

/**
 * @return {Promise<void>}
 */
function record () {
  return new Promise((resolve) => {
    // hold each chunk of video data in memory
    let chunks = []
    const recorder = new MediaRecorder(state.stream, {
      mimeType: 'video/webm;codecs=h264'
    })
    recorder.ondataavailable = event => {
      chunks.push(event.data)
    }
    recorder.onstop = () => {
      // assemble all chunks into a Blob
      state.blob = new Blob(chunks, {'type': 'video/webm'})
      state.file = new File([state.blob], 'candidate.webm', {type: 'video/webm'})
      resolve()
    }
    recorder.start()
    setTimeout(() => {
      recorder.stop()
    }, 5000)
  })
}

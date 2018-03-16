/* global Blob File getPlaybackElement getPreviewElement MediaRecorder saveAs */

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
 * @returns Promise<void>
 */
function createStream () {
  return enableWebcam()
    .then(startLivePreview)
}

/**
 * @returns Promise<void>
 */
function recordStream () {
  return record()
    .then(stopLivePreview)
    .then(disableWebcam)
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
function startLivePreview () {
  return new Promise((resolve, reject) => {
    const video = getPreviewElement()
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
function stopLivePreview () {
  const video = getPreviewElement()
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

/**
 * @returns {Promise<void>}
 */
function playbackVideo () {
  const video = getPlaybackElement()
  video.src = window.URL.createObjectURL(state.blob)
  return video.play()
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

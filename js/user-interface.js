/* global $ alert createStream recordStream downloadVideo */

function error (error) {
  console.error(error)
  alert('An error has occurred! See console for more information.')
}

function getPreviewElement () {
  return document.querySelector('video#preview')
}

function getPlaybackElement () {
  return document.querySelector('video#playback')
}

/**
 * Enable a button in user interface.
 */
function enableButton (button, handler) {
  $(button)
    .prop('disabled', false)
    .removeClass('disabled')
    .on('click', handler)
}

/**
 * Disable a button in user interface.
 */
function disableButton (button) {
  $(button)
    .prop('disabled', true)
    .addClass('disabled')
    .off('click')
}

function createStreamButtonClicked () {
  disableButton('#createButton')
  createStream()
    .then(() => { enableButton('#recordButton', recordStreamButtonClicked) })
    .catch(error)
}

function recordStreamButtonClicked () {
  disableButton('#recordButton')
  recordStream()
    .then(() => { enableButton('#playbackButton', playbackButtonClicked) })
    .then(() => { enableButton('#downloadButton', downloadButtonClicked) })
    .catch(error)
}

function playbackButtonClicked () {
  disableButton('#playbackButton')
  playbackVideo()
    .catch(error)
}

function downloadButtonClicked () {
  downloadVideo()
    .catch(error)
}

function initializeUserInterface () {
  enableButton('#createButton', createStreamButtonClicked)
  disableButton('#recordButton')
  disableButton('#playbackButton')
  disableButton('#downloadButton')
}

initializeUserInterface()

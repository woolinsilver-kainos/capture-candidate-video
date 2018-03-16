/* global $ alert createStream recordStream downloadVideo */

function error (error) {
  console.error(error)
  alert('An error has occurred! See console for more information.')
}

function getVideoElement () {
  return document.querySelector('video')
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
  disableButton('#create')
  createStream()
    .then(() => { enableButton('#record', recordStreamButtonClicked) })
    .catch(error)
}

function recordStreamButtonClicked () {
  disableButton('#record')
  recordStream()
    .then(() => { enableButton('#download', downloadButtonClicked) })
    .catch(error)
}

function downloadButtonClicked () {
  disableButton('#download')
  downloadVideo()
    .then(initializeUserInterface)
    .catch(error)
}

function initializeUserInterface () {
  enableButton('#create', createStreamButtonClicked)
  disableButton('#record')
  disableButton('#download')
}

initializeUserInterface()

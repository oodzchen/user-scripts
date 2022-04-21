// ==UserScript==
// @name     YouTube Drag Resizer
// @version  0.1.0
// @grant    none
// @include     http://*.youtube.*
// @include     https://*.youtube.*
// ==/UserScript==


let vidContainer = null
let videoEl = null
let flexEl = null
let button = null
let initVideoElHeight = 0
let userSettingHeight = 0

let startPageY = 0
let startContainerHeight = 0
let startVideoElHeight = 0
let timer = null

const observer = new MutationObserver(init);
const flexObserver = new MutationObserver(onVideoModeChange)


window.addEventListener('DOMContentLoaded', () => {
  // console.log('DOMContentLoaded!', document.body)
  observer.observe(document.body, {
    attributes: false,
    childList: true,
    subtree: false
  })
})

window.addEventListener('resize', onWindowResize)

function init() {
  vidContainer = document.querySelector('#player-theater-container');
  videoEl = document.querySelector('.html5-video-container>video');

  updateInitHeight();

  // console.log('flexy: ', document.querySelector('ytd-watch-flexy'))
  // console.log('vidContainer', vidContainer)
  // console.log('videoEl', videoEl)
  if (vidContainer && videoEl) {
    const hashResizeBtn = vidContainer.getAttribute('resize-btn');
    if (hashResizeBtn) return;

    const style = document.createElement('style')
    style.textContent = `
    .video-resize-controls{
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    #player-theater-container:hover .video-resize-controls{
      opacity: 1;
    }
    `

    document.head.appendChild(style)

    const div = document.createElement('div')
    button = document.createElement('button');

    div.classList.add('video-resize-controls')
    div.setAttribute('style', `position: absolute; left: 50%; bottom: 12px; width: 200px; text-align: center; z-index: 99;margin-left: -100px`)
    videoEl.style.fitObject = 'contain';
    button.textContent = 'Resize Video';
    button.onmousedown = onMouseDown
    button.setAttribute('style', 'margin-right: 10px; cursor: ns-resize')

    const clearButton = document.createElement('button')
    clearButton.textContent = 'Reset Style'
    clearButton.onclick = () => clearResize(true)

    div.appendChild(button)
    div.appendChild(clearButton)

    vidContainer.appendChild(div)
    vidContainer.setAttribute('resize-btn', '1')
  }

  flexEl = document.querySelector('ytd-watch-flexy')
  flexObserver.observe(flexEl, {
    attributes: true,
    childList: false,
    subtree: false
  })
}

function onWindowResize() {
  if (timer) {
    clearTimeout(timer)
    if (isTheaterMode()) {
      // console.log('on resize!!', videoEl.offsetWidth)
      userSettingHeight = 0
      clearResize()
      updateInitHeight()
    }
  }
  timer = setTimeout(() => {
    timer = null
    // console.log('on resize complete!!', videoEl.offsetWidth)
    updateInitHeight()
  }, 100)
}

function onVideoModeChange() {
  // console.log('video mode change')
  if (isTheaterMode()) {
    setTimeout(() => {
      updateInitHeight()
      recoverHeight()
    }, 0)
  } else {
    clearResize()
  }
}

function isTheaterMode() {
  return flexEl.hasAttribute('theater')
}

function isUserSetting() {
  return videoEl.hasAttribute('user-setting-height')
}

function updateInitHeight() {
  if (!isUserSetting()) {
    initVideoElHeight = videoEl.offsetHeight
  }
  // console.log("videoEl.offsetHeight", videoEl.offsetHeight)
}

function onMouseDown(e) {
  e.preventDefault()
  // console.log(e.pageX, e.pageY)
  startPageY = e.pageY
  startContainerHeight = vidContainer.offsetHeight
  startVideoElHeight = videoEl.offsetHeight

  document.documentElement.onmousemove = onMouseMove
  document.documentElement.onmouseup = onMouseUp
  document.documentElement.onmouseleave = onMouseUp
}

function onMouseMove(e) {
  e.preventDefault()
  const deltaY = e.pageY - startPageY;

  // console.log("deltaY", deltaY)

  let updateVideoElHeight = startVideoElHeight + deltaY

  if (updateVideoElHeight > initVideoElHeight || videoEl.offsetWidth >= window.innerWidth) updateVideoElHeight = initVideoElHeight
  userSettingHeight = updateVideoElHeight

  videoEl.style.height = `${updateVideoElHeight}px`
  videoEl.setAttribute('user-setting-height', updateVideoElHeight)
  vidContainer.style.height = `${updateVideoElHeight}px`
}

function onMouseUp(e) {
  e.preventDefault()
  // console.log("onMouseUp")

  document.documentElement.onmousemove = null
  document.documentElement.onmouseup = null
  document.documentElement.onmouseleave = null
}

function recoverHeight() {
  let prevHeight = userSettingHeight || initVideoElHeight
  vidContainer.style.height = `${prevHeight}px`
  videoEl.style.height = `${prevHeight}px`
  if(userSettingHeight) videoEl.setAttribute('user-setting-height', userSettingHeight)
}

function clearResize(isUpdateVideo = false) {
  vidContainer.style.height = ''
  videoEl.removeAttribute('user-setting-height')
  if (isUpdateVideo) {
    videoEl.style.height = `${initVideoElHeight}px`
  }
}

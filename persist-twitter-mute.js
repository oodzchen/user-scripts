// ==UserScript==
// @name     Persist Twitter(X) Mute
// @version  0.1.0
// @grant    GM.setValue
// @grant    GM.getValue
// @run-at   document-end
// @include  https://x.com/*
// @include  https://twitter.com/*
// ==/UserScript==

(async () => {
    let videoContainerEl, videoEl, muteBtn;

    const setPlayEvent = (vdoEl) => {
	vdoEl.onplay = async (ev) => {
	    const globalMuted = await GM.getValue('global_audio_muted', true)
	    
	    if (globalMuted != undefined){
		vdoEl.muted = globalMuted
	    }
	    
	}
    }

    const setMuteEvent = (vdoEl, mtEl) => {
	mtEl.onclick = (ev) => {
	    if (ev.isTrusted){
		if (vdoEl) {
		    GM.setValue('global_audio_muted', !vdoEl.muted)
		}
	    }
	}
    }

    const isInNodeList = (el, nodeList) => Array.from(nodeList).includes(el)

    const callback = (mutations, observer) => {
	for (const mutation of mutations) {
	    let tmpVCEl = mutation.target.querySelector('div[data-testid="videoComponent"]')
	    if (tmpVCEl && !isInNodeList(tmpVCEl, mutation.removedNodes)) {
		videoContainerEl = tmpVCEl
	    }

	    if (videoContainerEl){
		let tmpVEl = videoContainerEl.querySelector('video')
		if (tmpVEl && !isInNodeList(tmpVEl, mutation.removedNodes)){
		    videoEl = tmpVEl
		    setPlayEvent(videoEl)
		}

		let tmpMEl = videoContainerEl.querySelector('div.r-ero68b:nth-child(2) button')
		if (tmpMEl && !isInNodeList(tmpMEl, mutation.removedNodes)) {
		    muteBtn = tmpMEl
		}
	    }
	}

	if (!videoEl || !muteBtn) return

	setMuteEvent(videoEl, muteBtn)
    }

    const observer = new MutationObserver(callback)

    observer.observe(document.body, {
	attributes: false,
	childList: true,
	subtree: true,
    })

})()

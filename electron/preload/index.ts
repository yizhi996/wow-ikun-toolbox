import { ipcRenderer } from 'electron'

function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  }
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const styleContent = `
  .sk-chase--wrapper {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #282c34;
    z-index: 9;
  }
  .sk-chase {
    width: 70px;
    height: 70px;
    position: relative;
    animation: sk-chase 2.5s infinite linear both;
  }
  
  .sk-chase-dot {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0; 
    animation: sk-chase-dot 2.0s infinite ease-in-out both; 
  }
  
  .sk-chase-dot:before {
    content: '';
    display: block;
    width: 25%;
    height: 25%;
    background-color: #fff;
    border-radius: 100%;
    animation: sk-chase-dot-before 2.0s infinite ease-in-out both; 
  }
  
  .sk-chase-dot:nth-child(1) { animation-delay: -1.1s; }
  .sk-chase-dot:nth-child(2) { animation-delay: -1.0s; }
  .sk-chase-dot:nth-child(3) { animation-delay: -0.9s; }
  .sk-chase-dot:nth-child(4) { animation-delay: -0.8s; }
  .sk-chase-dot:nth-child(5) { animation-delay: -0.7s; }
  .sk-chase-dot:nth-child(6) { animation-delay: -0.6s; }
  .sk-chase-dot:nth-child(1):before { animation-delay: -1.1s; }
  .sk-chase-dot:nth-child(2):before { animation-delay: -1.0s; }
  .sk-chase-dot:nth-child(3):before { animation-delay: -0.9s; }
  .sk-chase-dot:nth-child(4):before { animation-delay: -0.8s; }
  .sk-chase-dot:nth-child(5):before { animation-delay: -0.7s; }
  .sk-chase-dot:nth-child(6):before { animation-delay: -0.6s; }
  
  @keyframes sk-chase {
    100% { transform: rotate(360deg); } 
  }
  
  @keyframes sk-chase-dot {
    80%, 100% { transform: rotate(360deg); } 
  }
  
  @keyframes sk-chase-dot-before {
    50% {
      transform: scale(0.4); 
    } 100%, 0% {
      transform: scale(1.0); 
    } 
  }`
  const oStyle = document.createElement('style')
  oStyle.innerHTML = styleContent

  const oDiv = document.createElement('div')
  oDiv.className = 'sk-chase--wrapper'
  oDiv.style.zIndex = '999'
  oDiv.innerHTML = `
  <div class="sk-chase">
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
  </div>`

  const oText = document.createElement('div')
  oText.textContent = '加载中...'
  oText.style.cssText = `margin-top: 50px;color:white;font-size:14px;`
  oDiv.appendChild(oText)

  const oReload = document.createElement('div')
  oReload.textContent = '重新加载'
  oReload.style.cssText = `display:none; cursor: pointer; margin-top: 20px;color:white;font-size:14px;`
  oReload.onclick = () => {
    ipcRenderer.send('reload-app')
  }
  oDiv.appendChild(oReload)

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
    loadingTimeout() {
      oText.textContent = '加载失败，请重新打开'
      oText.style.color = 'orange'
      oReload.style.display = ''
    }
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading, loadingTimeout } = useLoading()
domReady().then(appendLoading)

let timer = setTimeout(() => {
  loadingTimeout()
}, 1000 * 10)

window.onmessage = ev => {
  if (ev.data.payload === 'removeLoading') {
    removeLoading()
    clearTimeout(timer)
    timer = undefined
  }
}

const pattern = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
]

let current = 0

document.addEventListener(
  'keydown',
  event => {
    // If the key isn't in the pattern, or isn't the current key in the pattern, reset
    if (pattern.indexOf(event.key) < 0 || event.key !== pattern[current]) {
      current = 0
      return
    }

    // Update how much of the pattern is complete
    current++

    // If complete, alert and reset
    if (pattern.length === current) {
      current = 0

      ipcRenderer.send('open-dev-tools')
    }
  },
  false
)

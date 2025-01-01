import manifest from '../manifest.json' assert {type: 'json'}

async function getHostname() {
  const store = await chrome.storage.sync.get()
  console.log('hostname', store, manifest)
  // document.querySelector('input').value = store.searxHostname
  // location.href = store.searxHostname
}

async function setHostname() {
  console.log('set hostname')
  return chrome.storage.sync.set({ searxHostname: `https://searx.namejeff.xyz/search?q=${new Date().toISOString()}` })
}

;(async () => {
  // await chrome.storage.sync.set({ searxHostname: `https://searx.namejeff.xyz/search?q=${new Date().toISOString()}` })
  // location.href = await chrome.storage.sync.get('searxHostname')
  // console.log(
  //   'hi from newTab.js',
  //   await chrome.storage.sync.get('searxHostname'),
  //   await chrome.storage.sync.get('searxIsNewTab')
  // )

  await getHostname()

  window.addEventListener('load', async () => {
    // documenﬁt.querySelector('button').addEventListener('click', async () => {
    // await setHostname()
    // })
  })
})()

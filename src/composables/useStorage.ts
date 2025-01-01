import { isEqual } from 'lodash-es'
import { ref, toRaw, watch } from 'vue'

import { Storage } from '@plasmohq/storage'

export enum StorageKey {
  searxHostname = 'searxHostname',
  searxIsNewTab = 'searxIsNewTab',
  searxTheme = 'searxTheme'
}

const storage = new Storage()

export function useStorage() {
  const searxHostname = ref<string | null>(null)
  const searxIsNewTab = ref<boolean>(false)
  const searxTheme = ref<string>('auto')

  // Load the initial values from storage
  Promise.all([
    storage.get(StorageKey.searxHostname),
    storage.get(StorageKey.searxIsNewTab),
    storage.get(StorageKey.searxTheme)
  ]).then(([hostnameValue, isNewTabValue, themeValue]) => {
    console.log('storage gotten', hostnameValue, isNewTabValue, themeValue)
    if (hostnameValue != null) {
      searxHostname.value = hostnameValue
      console.debug(`Loaded ${StorageKey.searxHostname} from storage:`, { value: hostnameValue })
    }

    if (isNewTabValue != null) {
      searxIsNewTab.value = isNewTabValue as unknown as boolean
      console.debug(`Loaded ${StorageKey.searxIsNewTab} from storage:`, { value: isNewTabValue })
    }

    if (themeValue != null) {
      searxTheme.value = themeValue
      console.debug(`Loaded ${StorageKey.searxTheme} from storage:`, { value: themeValue })
    }
  })

  // Save the value to storage when it changes
  watch(searxHostname, async (newValue, oldValue) => {
    newValue = toRaw(newValue)
    oldValue = toRaw(oldValue)

    if (isEqual(newValue, oldValue)) {
      return
    }

    // TODO: Skip until initial value is set

    await storage.set(StorageKey.searxHostname, newValue)

    console.debug(`Saved ${StorageKey.searxHostname} to storage:`, { newValue, oldValue })
  })

  // Save the value to storage when it changes
  watch(searxIsNewTab, async (newValue, oldValue) => {
    newValue = toRaw(newValue)
    oldValue = toRaw(oldValue)

    if (isEqual(newValue, oldValue)) {
      return
    }

    // TODO: Skip until initial value is set

    await storage.set(StorageKey.searxIsNewTab, newValue)

    console.debug(`Saved ${StorageKey.searxIsNewTab} to storage:`, { newValue, oldValue })
  })

  // Save the value to storage when it changes
  watch(searxTheme, async (newValue, oldValue) => {
    newValue = toRaw(newValue)
    oldValue = toRaw(oldValue)

    if (isEqual(newValue, oldValue)) {
      return
    }

    // TODO: Skip until initial value is set

    await storage.set(StorageKey.searxTheme, newValue)

    console.debug(`Saved ${StorageKey.searxTheme} to storage:`, { newValue, oldValue })
  })

  // Watch for changes to the storage
  storage.watch({
    [StorageKey.searxHostname]: (changes) => {
      searxHostname.value = changes.newValue

      setHostnameRules(changes.newValue)
    }
  })

  // Watch for changes to the storage
  storage.watch({
    [StorageKey.searxIsNewTab]: (changes) => {
      searxIsNewTab.value = changes.newValue

      setNewTabRules(changes.newValue)
    }
  })

  // Watch for changes to the storage
  storage.watch({
    [StorageKey.searxTheme]: (changes) => {
      searxTheme.value = changes.newValue

      setNewTabRules(changes.newValue)
    }
  })

  return {
    searxHostname,
    searxIsNewTab,
    searxTheme
  }
}

async function setHostnameRules(searxHostname: string) {
  // Verify hostname
  try {
    new URL(`https://${searxHostname}`)
  } catch (error) {
    console.error('Invalid hostname:', searxHostname)
    return
  }

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [3],
    addRules: [
      {
        id: 3,
        priority: 10,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            transform: {
              host: searxHostname
            }
          }
        },
        condition: {
          urlFilter: '||searx.localhost',
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
            chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
            chrome.declarativeNetRequest.ResourceType.STYLESHEET,
            chrome.declarativeNetRequest.ResourceType.SCRIPT,
            chrome.declarativeNetRequest.ResourceType.IMAGE,
            chrome.declarativeNetRequest.ResourceType.FONT,
            chrome.declarativeNetRequest.ResourceType.OBJECT,
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
            chrome.declarativeNetRequest.ResourceType.PING,
            chrome.declarativeNetRequest.ResourceType.CSP_REPORT,
            chrome.declarativeNetRequest.ResourceType.MEDIA,
            chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
            chrome.declarativeNetRequest.ResourceType.OTHER
          ]
        }
      }
    ]
  })
}

async function setNewTabRules(searxIsNewTab: boolean) {
  // chrome.
}

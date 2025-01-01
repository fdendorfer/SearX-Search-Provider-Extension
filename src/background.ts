import { useStorage } from '~composables/useStorage'

;(async () => {
  const { searxHostname, searxIsNewTab } = useStorage()

  console.info(`Background script is running`, searxHostname.value, searxIsNewTab.value)
})()

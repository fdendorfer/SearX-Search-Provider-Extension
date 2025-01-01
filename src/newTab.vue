<script setup lang="ts">
  import { computed, onBeforeMount, onMounted, ref, Suspense, useTemplateRef } from 'vue'

  import { useStorage } from './composables/useStorage'

  const { searxHostname, searxIsNewTab, searxTheme } = useStorage()
  console.log('first', searxHostname.value)

  //#region utils
  function debounce(mainFunction, delay) {
    // Declare a variable called 'timer' to store the timer ID
    let timer

    // Return an anonymous function that takes in any number of arguments
    return function (...args) {
      // Clear the previous timer to prevent the execution of 'mainFunction'
      clearTimeout(timer)

      // Set a new timer that will execute 'mainFunction' after the specified delay
      timer = setTimeout(() => {
        mainFunction(...args)
      }, delay)
    }
  }
  function setCookie(cname, cvalue, exdays) {
    const d = new Date()
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
    let expires = 'expires=' + d.toUTCString()
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
  }
  function getCookie(cname) {
    let name = cname + '='
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) == ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length)
      }
    }
    return ''
  }
  function fuzzySearch(query, dataset) {
    const q = query ? query.trim().toLowerCase() : ''

    const matchingIndices: number[] = []
    if (q.length == 0) {
      for (let i = 0; i < dataset.length; i++) {
        matchingIndices.push(i)
      }
      return matchingIndices
    }

    dataset.forEach(function (d, index) {
      const s = d.trim().toLowerCase()
      let i = 0
      let n = -1
      let l
      for (; (l = q[i++]); ) if (!~(n = s.indexOf(l, n + 1))) return
      matchingIndices.push(index)
    })
    return matchingIndices
  }
  //#endregion

  const autocompleteOpen = ref(false)
  const suggestions = ref([] as number[])

  const input = useTemplateRef('q')
  const form = useTemplateRef('form')
  const autocomplete = useTemplateRef('autocomplete')

  function onInputKeyDown(e) {
    if (e.key === 'ArrowDown') {
      const listItems = [...document.querySelectorAll('.autocomplete li')]
      let findActive = listItems.findIndex((li) => li.classList.contains('active'))
      if (findActive + 1 >= listItems.length) findActive = -1
      listItems.forEach((li) => li.classList.remove('active'))
      selectItem(listItems[findActive + 1])
    }
    if (e.key === 'ArrowUp') {
      const listItems = [...document.querySelectorAll('.autocomplete li')]
      let findActive = listItems.findIndex((li) => li.classList.contains('active'))
      if (findActive <= 0) findActive = listItems.length
      listItems.forEach((li) => li.classList.remove('active'))
      selectItem(listItems[findActive - 1])
    }
  }

  function selectItem(targetItem) {
    input.value!.value = targetItem.innerText
    targetItem.classList.add('active')
    targetItem.scrollIntoView(false)
  }

  function onFormSubmit(e) {
    let queries = JSON.parse(getCookie('searxQuery')) || []
    queries = queries.filter((q) => q !== input.value)
    queries.push(input.value)

    setCookie('searxQuery', JSON.stringify(queries), 365)
  }

  function updateSuggestions() {
    autocompleteOpen.value = true
    const query = input.value
    const queries = JSON.parse(getCookie('searxQuery')) || []

    queries.map((q) => q.replace(query, `<strong>${query}</strong>`))
    const results = fuzzySearch(query, queries.reverse())

    suggestions.value = results.slice(0, 9)
  }

  onBeforeMount(async () => {
    console.log('before mount', searxIsNewTab.value)
    chrome.storage.sync.get('searxIsNewTab', function (storage) {
      console.log('storage', storage)
      if (storage.searxIsNewTab) {
        chrome.tabs.update({ url: 'chrome-search://local-ntp/local-ntp.html' })
        // chrome.tabs.update({ url: 'chrome://newtab' })
      }
    })
    // if (searxIsNewTab.value) {
    //   chrome.tabs.update({ url: 'chrome-search://local-ntp/local-ntp.html' })
    // }
  })

  onMounted(async () => {
    console.log('mounted', searxIsNewTab.value)
  })

  // input.addEventListener('input', debounce(updateSuggestions, 250))
  // input.addEventListener('keydown', onInputKeyDown)
  // input.addEventListener('focus', () => updateSuggestions())
  // input.addEventListener('blur', () => setTimeout(() => autocomplete.classList.remove('open'), 150))
  // form.addEventListener('submit', onFormSubmit)
  // document.addEventListener('DOMContentLoaded', init)

  const themeClass = computed(() => {
    switch (searxTheme.value) {
      case 'light':
        return 'theme-light'
      case 'dark':
        return 'theme-dark'
      case 'black':
        return 'theme-black'
      default:
        return 'theme-auto'
    }
  })
</script>

<template>
  <main :class="themeClass">
    <div class="title">
      <img
        src="https://raw.githubusercontent.com/searxng/searxng/master/src/brand/searxng.svg"
        alt="SearXNG Logo"
      />
    </div>

    <p>{{ searxIsNewTab }}</p>

    <form
      id="search"
      method="GET"
      :action="'https://' + searxHostname + '/search'"
      role="search"
      ref="form"
    >
      <div
        class="search_box"
        ref="search_box"
      >
        <input
          id="q"
          ref="q"
          name="q"
          type="text"
          placeholder="Search for..."
          autocapitalize="none"
          autocomplete="off"
          autocorrect="off"
          autofocus="true"
          dir="auto"
          spellcheck="false"
          value=""
        />
        <button
          id="clear_search"
          type="reset"
          aria-label="clear"
        >
          <svg
            viewBox="0 0 512 512"
            class="ion-icon-big"
            aria-hidden="true"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="32"
              d="M368 368L144 144M368 144L144 368"
            ></path>
          </svg>
        </button>
        <button
          id="send_search"
          type="submit"
          aria-label="search"
        >
          <svg
            viewBox="0 0 512 512"
            class="ion-icon-big"
            aria-hidden="true"
          >
            <path
              d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z"
              fill="none"
              stroke="currentColor"
              stroke-miterlimit="10"
              stroke-width="32"
            ></path>
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-miterlimit="10"
              stroke-width="32"
              d="M338.29 338.29L448 448"
            ></path>
          </svg>
        </button>

        <div
          :class="{ autocomplete: true, open: autocompleteOpen }"
          ref="autocomplete"
        >
          <ul>
            <li
              v-for="suggestion in suggestions"
              @click="selectItem"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </form>
  </main>
</template>

<style>
  :root:has(.theme-auto) {
    --color-autocomplete-background-hover: #e3e3e3;
    --color-autocomplete-background: #fff;
    --color-autocomplete-border: #bbb;
    --color-autocomplete-font: #000;
    --color-autocomplete-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
    --color-base-background: #fff;
    --color-base-font: #444;
    --color-search-background-hover: #3050ff;
    --color-search-background: #fff;
    --color-search-border: #bbb;
    --color-search-font: #222;
    --color-search-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
  }

  @media (prefers-color-scheme: dark) {
    :root:has(.theme-auto) {
      --color-autocomplete-background-hover: #1e1e22;
      --color-autocomplete-background: #2b2e36;
      --color-autocomplete-border: #555;
      --color-autocomplete-font: #fff;
      --color-autocomplete-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
      --color-base-background: #222428;
      --color-base-font: #bbb;
      --color-search-background-hover: #58f;
      --color-search-background: #2b2e36;
      --color-search-border: #555;
      --color-search-font: #fff;
      --color-search-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
    }
  }

  :root:has(.theme-light) {
    --color-autocomplete-background-hover: #e3e3e3;
    --color-autocomplete-background: #fff;
    --color-autocomplete-border: #bbb;
    --color-autocomplete-font: #000;
    --color-autocomplete-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
    --color-base-background: #fff;
    --color-base-font: #444;
    --color-search-background-hover: #3050ff;
    --color-search-background: #fff;
    --color-search-border: #bbb;
    --color-search-font: #222;
    --color-search-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
  }

  :root:has(.theme-dark) {
    --color-autocomplete-background-hover: #1e1e22;
    --color-autocomplete-background: #2b2e36;
    --color-autocomplete-border: #555;
    --color-autocomplete-font: #fff;
    --color-autocomplete-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
    --color-base-background: #222428;
    --color-base-font: #bbb;
    --color-search-background-hover: #58f;
    --color-search-background: #2b2e36;
    --color-search-border: #555;
    --color-search-font: #fff;
    --color-search-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
  }

  :root:has(.theme-black) {
    --color-autocomplete-background-hover: #1e1e22;
    --color-autocomplete-background: #2b2e36;
    --color-autocomplete-border: #555;
    --color-autocomplete-font: #fff;
    --color-autocomplete-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
    --color-base-background: #000;
    --color-base-font: #bbb;
    --color-search-background-hover: #58f;
    --color-search-background: #2b2e36;
    --color-search-border: #555;
    --color-search-font: #fff;
    --color-search-shadow: 0 2px 8px rgba(34, 38, 46, 0.25);
  }

  html {
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    background-color: var(--color-base-background);
    color: var(--color-base-font);
    font-family: sans-serif;
    font-size: 0.9em;
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
    text-size-adjust: 100%;
  }

  body {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    margin: 0;
    padding: 0;
  }

  body > * {
    width: 100%;
  }

  main {
    margin: 0 auto;
    max-width: min(75%, 800px);
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  button {
    display: flex;
  }

  svg {
    height: 1.5rem;
  }

  .title {
    margin: 0 auto;
  }

  .title img {
    height: 4rem;
    width: 100%;
  }

  .search_box {
    border-radius: 0.8rem;
    box-shadow: var(--color-search-shadow);
    display: inline-flex;
    flex-direction: row;
    position: relative;
    white-space: nowrap;
    width: 100%;
  }

  #q {
    background: none repeat scroll 0 0 var(--color-search-background);
    border-radius: 0.8rem 0 0 0.8rem;
    border: none;
    color: var(--color-search-font);
    font-size: 1.1rem;
    line-height: 1.5rem;
    outline: 0;
    padding: 0.8rem;
    width: 100%;
  }

  #q::-ms-clear,
  #q::-webkit-search-cancel-button {
    display: none;
  }

  #clear_search:hover {
    color: var(--color-search-background-hover);
  }

  #q:placeholder-shown + #clear_search {
    display: none;
  }

  #clear_search,
  #send_search {
    background: var(--color-search-background);
    border: none;
    color: var(--color-search-font);
    display: flex;
    outline: none;
    padding: 0.8rem;
  }

  #send_search {
    border-radius: 0 0.8rem 0.8rem 0;
  }

  #send_search:hover {
    background-color: var(--color-search-background-hover);
    color: var(--color-search-background);
    cursor: pointer;
  }

  .autocomplete {
    background-color: var(--color-autocomplete-background);
    border-radius: 10px;
    display: none;
    max-height: 0;
    overflow-y: hidden;
    position: absolute;
    text-align: left;
    top: calc(100% + 1rem);
    width: 100%;
  }

  .autocomplete:empty {
    display: none;
  }

  .autocomplete > ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .autocomplete > ul > li {
    cursor: pointer;
    padding: 0.5rem 1rem;
    pointer-events: all;
  }

  .autocomplete > ul > li.active,
  .autocomplete > ul > li:active,
  .autocomplete > ul > li:focus,
  .autocomplete > ul > li:hover {
    background-color: var(--color-autocomplete-background-hover);
  }

  .autocomplete.open {
    background-color: var(--color-autocomplete-background);
    border-radius: 0.8rem;
    color: var(--color-autocomplete-font);
    display: block;
    max-height: 32rem;
    overflow-y: auto;
    z-index: 10;
  }

  .autocomplete.open:empty {
    display: none;
  }
</style>

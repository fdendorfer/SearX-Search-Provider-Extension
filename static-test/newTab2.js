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

  const matchingIndices = []
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

const input = document.querySelector('input')
const form = document.querySelector('form')
const autocomplete = document.querySelector('.autocomplete')
const autocompleteList = document.querySelector('.autocomplete ul')
const autocompleteItems = document.querySelectorAll('.autocomplete li')

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
  input.value = targetItem.innerText
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
  autocomplete.classList.add('open')
  const query = input.value
  const queries = JSON.parse(getCookie('searxQuery')) || []
  autocompleteList.innerHTML = ''

  const results = fuzzySearch(query, queries.reverse())

  results.slice(0, 9).forEach((qIndex) => {
    const li = document.createElement('li')
    li.addEventListener('click', () => selectItem(li))
    li.innerHTML = queries[qIndex].replace(query, `<strong>${query}</strong>`)
    autocompleteList.appendChild(li)
  })
}

async function init() {
  const { searxHostname } = await chrome.storage.sync.get('searxHostname')
  console.log('init', searxHostname)
  form.setAttribute('action', `${searxHostname}/search`)
}

input.addEventListener('input', debounce(updateSuggestions, 250))
input.addEventListener('keydown', onInputKeyDown)
input.addEventListener('focus', () => updateSuggestions())
input.addEventListener('blur', () => setTimeout(() => autocomplete.classList.remove('open'), 150))
form.addEventListener('submit', onFormSubmit)
document.addEventListener('DOMContentLoaded', init)

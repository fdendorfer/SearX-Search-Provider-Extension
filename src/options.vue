<script lang="ts" setup>
  import '~style.css'

  import { useStorage } from './composables/useStorage'

  const { searxHostname, searxIsNewTab, searxTheme } = useStorage()
</script>

<template>
  <Suspense>
    <div class="relative flex h-full flex-col gap-12 overflow-hidden p-4">
      <!-- Background -->
      <svg
        class="absolute -bottom-[46%] -right-[44%] -z-10 h-full w-full"
        height="1000"
        viewBox="0 0 500 1000"
        width="500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Blur -->
          <filter
            id="b"
            filterUnits="userSpaceOnUse"
            height="2000"
            width="1000"
            x="-250"
            y="-500"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="30"
            />
          </filter>

          <!-- Gradient -->
          <radialGradient
            id="c"
            cx="50%"
            cy="50%"
            fx="70%"
            fy="39%"
            r="50%"
          >
            <!-- Tailwind's indigo[600] -->
            <stop
              offset="0%"
              stop-color="#4f46e5"
            />
            <!-- Tailwind's fuchsia[500] -->
            <stop
              offset="100%"
              stop-color="rgba(194,68,247,0.2)"
            />
          </radialGradient>
        </defs>

        <g filter="url(#b)">
          <svg
            viewBox="0 0 500 500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M401.5 327.5Q340 405 233.5 434t-141-77.5Q58 250 115.5 183t138-73q80.5-6 145 67t3 150.5Z"
              fill="url(#c)"
            />
          </svg>
        </g>
      </svg>

      <!-- Body -->
      <main class="flex-1">
        <!-- Header -->
        <header class="">
          <h1 class="text-lg font-semibold leading-8 text-base-content-highlight">SearX Options</h1>
          <p class="text-sm leading-5">All settings are automatically saved.</p>
        </header>

        <!-- Form -->
        <form class="">
          <label
            class="mt-8 block"
            for="searx-hostname"
          >
            SearX Instance Host
          </label>
          <div class="flex rounded-md shadow-sm">
            <span class="inline-flex items-center rounded-l-md border border-r-0 border-base-300 px-3 sm:text-sm">
              https://
            </span>

            <input
              id="searx-hostname"
              v-model="searxHostname"
              aria-describedby="searx-hostname-description"
              class="focus-visible:focus-outline-util block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-1.5 text-base-content-highlight ring-1 ring-inset ring-base-300 sm:text-sm sm:leading-6"
              name="searx-hostname"
              placeholder="searx.example.com"
              required
              type="text"
            />
          </div>

          <p
            id="searx-hostname-description"
            class="mt-2"
          >
            You can find a list of instances in
            <a
              class="hover:hover-text-util focus-visible:focus-outline-util underline"
              href="https://searx.space"
              target="_blank"
            >
              searx.space
            </a>
          </p>

          <label
            class="mt-8 block"
            for="searx-isNewTab"
          >
            Do you want to land on SearX when you open a new tab?
          </label>
          <div class="mt-2 flex">
            <input
              id="searx-isNewTab"
              v-model="searxIsNewTab"
              aria-describedby="searx-isNewTab-description"
              class=""
              name="searx-isNewTab"
              required
              type="checkbox"
            />
            <label
              for="searx-isNewTab"
              class="ml-2 text-sm"
            >
              Yes, I want to use SearX as my new tab
            </label>
          </div>

          <div class="mt-8">
            <label
              for="searx-theme-select"
              class="block"
              >New Tab Theme</label
            >
            <select
              v-model="searxTheme"
              id="searx-theme-select"
            >
              <option value="auto">Auto (matches your device theme)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="black">Black</option>
            </select>
          </div>
        </form>
      </main>

      <footer class="flex-none text-center text-sm font-medium">
        Made with <span class="text-xl">⌨</span> by
        <a
          class="hover:hover-text-util focus-visible:focus-outline-util text-base-content-highlight underline"
          href="https://akbal.dev"
          target="_blank"
        >
          Alejandro Akbal
        </a>
      </footer>
    </div>
  </Suspense>
</template>

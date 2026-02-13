const { createApp, ref, onMounted, watch } = Vue

const routeToFile = {
  '/': 'index.html',
  '/shop': 'shop.html',
  '/cart': 'cart.html',
  '/checkout': 'checkout.html',
  '/contact': 'contact.html'
}

const normalizePath = () => {
  const hash = window.location.hash.replace('#', '') || '/'
  return routeToFile[hash] ? hash : '/'
}

const setupLegacyUi = () => {
  const spinner = document.getElementById('spinner')
  if (spinner) setTimeout(() => spinner.classList.remove('show'), 1)

  const onScroll = () => {
    const navBar = document.querySelector('.nav-bar')
    if (navBar) {
      navBar.classList.toggle('sticky-top', window.scrollY > 45)
      navBar.classList.toggle('shadow-sm', window.scrollY > 45)
    }

    document.querySelectorAll('.back-to-top').forEach((el) => {
      el.style.display = window.scrollY > 300 ? 'block' : 'none'
    })
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  document.querySelectorAll('.quantity button').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.closest('.quantity')?.querySelector('input')
      if (!input) return
      const oldValue = Number(input.value || 0)
      input.value = button.classList.contains('btn-plus')
        ? String(oldValue + 1)
        : String(Math.max(0, oldValue - 1))
    })
  })
}

createApp({
  setup() {
    const route = ref(normalizePath())
    const pageHtml = ref('')

    const loadPage = async () => {
      const file = routeToFile[route.value] || routeToFile['/']
      const response = await fetch(`src/legacy-pages/${file}`)
      pageHtml.value = await response.text()
      requestAnimationFrame(setupLegacyUi)
    }

    const handleHashChange = () => {
      route.value = normalizePath()
    }

    onMounted(() => {
      window.addEventListener('hashchange', handleHashChange)
      loadPage()
    })

    watch(route, loadPage)

    return { pageHtml }
  },
  template: `<div v-html="pageHtml"></div>`
}).mount('#app')

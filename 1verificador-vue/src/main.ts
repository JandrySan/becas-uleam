
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import DetailView from './views/DetailView.vue'

const routes = [
	{ path: '/', name: 'home', component: HomeView },
	{ path: '/detalle/:id', name: 'detalle', component: DetailView, props: true },
]

const router = createRouter({
	history: createWebHashHistory('/vue/'),
	routes,
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

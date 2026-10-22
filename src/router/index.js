import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const view = (load, roles) => ({ component: load, meta: { roles } })

const routes = [
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('@/views/RegisterView.vue'), meta: { guest: true } },
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', redirect: () => useUserStore().home },
      { path: 'search', ...view(() => import('@/views/passenger/SearchView.vue'), ['PASSENGER']) },
      {
        path: 'payment/callback',
        ...view(() => import('@/views/passenger/PaymentCallbackView.vue'), ['PASSENGER']),
      },
      { path: 'trips', ...view(() => import('@/views/passenger/TripsView.vue'), ['PASSENGER']) },
      {
        path: 'notifications',
        ...view(() => import('@/views/NotificationsView.vue'), ['PASSENGER', 'DRIVER']),
      },
      {
        path: 'driver/vehicle',
        ...view(() => import('@/views/driver/VehicleView.vue'), ['DRIVER']),
      },
      {
        path: 'driver/departures',
        ...view(() => import('@/views/driver/DeparturesView.vue'), ['DRIVER']),
      },
      {
        path: 'driver/departures/:id/details',
        ...view(() => import('@/views/driver/DepartureDetailsView.vue'), ['DRIVER']),
      },
      { path: 'admin/routes', ...view(() => import('@/views/admin/RoutesView.vue'), ['ADMIN']) },
      { path: 'admin/drivers', ...view(() => import('@/views/admin/DriversView.vue'), ['ADMIN']) },
      { path: 'admin/users', ...view(() => import('@/views/admin/UsersView.vue'), ['ADMIN']) },
      { path: 'admin/issues', ...view(() => import('@/views/admin/IssuesView.vue'), ['ADMIN']) },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })

const KNOWN_ROLES = ['PASSENGER', 'DRIVER', 'ADMIN']

router.beforeEach((to) => {
  const store = useUserStore()
  if (store.isAuthenticated && !KNOWN_ROLES.includes(store.role)) {
    // Stale or unrecognised session: drop it rather than bounce between pages
    store.clearUser()
    return to.path === '/login' ? true : '/login'
  }
  if (to.meta.guest && store.isAuthenticated) return store.home
  if (to.matched.some((r) => r.meta.auth) && !store.isAuthenticated) return '/login'
  const roles = to.meta.roles
  if (roles && !roles.includes(store.role) && to.path !== store.home) return store.home
})

export default router

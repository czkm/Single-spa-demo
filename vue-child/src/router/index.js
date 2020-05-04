import Vue from 'vue'
import VueRouter from 'vue-router'



Vue.use(VueRouter)

  const routes = [
  
  {
    path: '/child1',
    name: 'child1',
  
    component: () => import(/* webpackChunkName: "child2" */ '../views/child1.vue')
  },
  {
    path: '/child2',
    name: 'child2',
    component: () => import(/* webpackChunkName: "child2" */ '../views/child2.vue')
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

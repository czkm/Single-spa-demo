import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
      { 
          path: '/single-router',
          name: 'single-router'
        }
    ]
})
export default router
# Single-spa-demo

```
 ---parent    父项目
   |
 --vue-child  ant design ui
   |
 --vue-child2 element ui

```
分别启动项目后 在parent运行npm run serve

#### 微前端简单实践
##### 什么是single-spa或者说什么是微前端
微前端是指存在于浏览器中的`微服务`。
- 微服务大家应该都听过
微服务是指后端服务，把一个大型的单个应用程序和服务拆分为数个甚至数十个的支持微服务，它可扩展单个组件而不是整个的应用程序堆栈，从而满足服务等级协议。它们在自己的操作系统中运行，管理自己的数据库并通过网络进行彼此间的通信。

 - 微前端作为用户界面的一部分，通常由许多组件组成，并使用类似于React、Vue和Angular等框架来渲染组件。每个微前端可以由不同的团队进行管理，并可以自主选择框架。每个微前端都拥有独立的git仓库、package.json和构建工具配置。

 - 共同点
独立的构建和部署。将DOM视为微前端使用的共享资源。一个微前端的DOM不能够被其他微前端触及，类似于一个微服务的数据库不应该被其他没有权限的微服务触及。

##### 主应用构建
```
——mian主应用
  ｜-public
  ｜-src
     ｜-router
     ｜-app.vue//应用主入口
     ｜-main.js
  ｜-single-spa-config.js
  ｜-vue.config.js
```
1. 使用@vue/cli 4.x以上版本构建应用，输入`vue create main`利用cli进行项目初始化
2. 安装single-spa和antui依赖`npm install ant-design-vue single-spa --save -d`并在`mian.js`中引入
```
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Ant from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import '../single-spa-config.js'
Vue.use(Ant);
Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
```
3. 在路由中注册统一路由，我们注册一个子服务路由，不填写component字段。
```
  {
    path: '/single-router',
    name: 'single-router',
  }
```
4. 初始化界面设置2个a标签，此时设置主应用的路由模式为history
```
 <a href="/vue-antd#"/>
 <a href="/vue-element#"/>
```
   ![初始化demo界面](https://upload-images.jianshu.io/upload_images/15259843-48d71e57f9d9e856.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5.  配置single-spa-config.js
- singleSpa.registerApplication这是注册子应用的方法。
接受appName: 子应用名称，applicationOrLoadingFn: 子应用注册函数，子应用需要返回 single-spa 的生命周期对象。
activityFn: 回调函数入参 location 对象，可以写自定义匹配路由加载规则。

```
// single-spa-config.js
import * as singleSpa from 'single-spa'; //导入single-spa
/*
* runScript：一个promise同步方法。可以代替创建一个script标签，然后加载
*/
const runScript = async (url) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
    });
};
singleSpa.registerApplication( //注册微前端服务
    'singleVue', 
    async () => {//异步加载本地3000端口下的chunk
            await runScript('http://127.0.0.1:3000/js/chunk-vendors.js');
            await runScript('http://127.0.0.1:3000/js/app.js'); 
            return window.singleVue;
        }
    },
    location => location.pathname.startsWith('/vue-antd') 
    // 配置微前端模块前缀，对应刚才链接的`/vue-antd`二者名字相同即可
);
singleSpa.start(); // 加载所有配置后调用则启动
```
##### 子应用构建
```
——child子应用
  ｜-public
  ｜-src
     ｜-router
     ｜-view
     ｜-app.vue//应用主入口
     ｜-main.js
  ｜-single-spa-config.js
  ｜-vue.config.js
```
1. 使用@vue/cli构建应用，输入`vue create child1`利用cli进行项目初始化
2. 安装single-spa-vue依赖`npm install single-spa-vue --save -d`并在`mian.js`中引入
```
import Vue from 'vue'
import App from './App.vue'
import singleSpaVue from "single-spa-vue"
import router from './router'
Vue.config.productionTip = false
const vueOptions = {//single-spa模式挂载在主应用的vue节点上
  el: "#vue",
  router,
  render: h => h(App),
}
if (!window.singleSpaNavigate) { // 如果不是single-spa模式则挂载在自身的app节点上
  delete vueOptions.el;
  new Vue(vueOptions).$mount('#app');
}
// singleSpaVue包装一个vue微前端服务对象
const vueLifecycles = singleSpaVue({
    Vue,
    appOptions: vueOptions
});
// 导出生命周期对象
export const bootstrap = vueLifecycles.bootstrap; // 启动时
export const mount = vueLifecycles.mount; // 挂载时
export const unmount = vueLifecycles.unmount; // 卸载时
export default vueLifecycles;
```
3. vue.config.js设置安装stats-webpack-plugin插件`npm install stats-webpack-plugin --save -d`
```
const StatsPlugin = require('stats-webpack-plugin');
const path = require('path');
module.exports = {
    publicPath: "//localhost:3000/",//子应用打包端口，需要和主应用引入端口相同
    css: {
        extract: false
    },
    configureWebpack: {
        devtool: 'none', // 不打包sourcemap
        output: {
            library: "singleVue", // 导出名称
            libraryTarget: "window", //挂载目标
        },
        resolve: {
            alias: {
              "~": path.resolve(__dirname, 'src/'),
              "moment$": "moment/moment.js"
            }
          },
//在每次打包结束后，都生成一个manifest.json 文件，里面存放着本次打包的 
//public_path bundle list chunk list 文件大小依赖等等信息。
        plugins: [
            new StatsPlugin('manifest.json', {
                chunkModules: false,
                entrypoints: true,
                source: false,
                chunks: false,
                modules: false,
                assets: false,
                children: false,
                exclude: [/node_modules/]
            }),
        ]
    },
    devServer: {
        contentBase: './',
        compress: true,
    }
};
```
4. 子应用启动`vue-cli-service serve --port 3000`就可以在主项目中看到
![子应用1](https://upload-images.jianshu.io/upload_images/15259843-03267ec7f9675178.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
5. 后续子应用的添加只需在主应用  `main.js`中调`singleSpa.registerApplication`新增即可
此时[简单demo](https://github.com/czkm/Single-spa-demo)


#### 微前端优化相关思路


基于iframe的微前端因为不使用所以不在本文中出现具体表现为每一个子系统的子页面均是由iframe加载的，不同模块的前端应用之间可以相互独立运行
一开始就引入了多个应用的js。是把子应用直接加载到页面中。所有的子应用都运行在同一个内存空间。

---  
  [simple-single-spa-webpack-example](https://github.com/joeldenning/simple-single-spa-webpack-example/blob/master/src/root-application/root-application.js)
![导入建议](https://upload-images.jianshu.io/upload_images/15259843-bfda3ab563036ee4?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
    
1. 导航区域在项目中充当调度者的角色，由它来决定在不同的条件下激活不同的子应用。     因此则仅仅是：导航路由 + 资源加载框架
![整体布局](https://upload-images.jianshu.io/upload_images/15259843-c2b1d651e0e4675a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 由于single-spa，是所有子应用共享一个html文件的。子应用包装器接管了子应用的入口组件render行为，所以主应用的html可以动态添加一个dom节点再将子项目入口组件渲染到这个dom节点上主应用需要在子应用加载之前构建好相应的容器节点 (比如 “#vue” 节点)，避免子应用挂在节点找不到而报错。
      ![主应用](https://upload-images.jianshu.io/upload_images/15259843-8fedc9ee244324d1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
      ![子应用](https://upload-images.jianshu.io/upload_images/15259843-37a323104931cd97.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


3. 直接将子应用打包出来后 HTML 作为入口，子应用可以通过 fetch html 的方式获取子应用的静态资源，同时将 HTML document。 作为子节点塞到主框架的容器中。减少主应用的接入成本，子应用的开发方式及打包方式基本上也不需要调整，而且可以天然的解决子应用之间样式隔离的问题。在用HTML作为入口的 方案下，主应用注册子应用的方式则变成```registerApp('subApp1', { entry: '//test/index.html'})```

4. 在请求HTML的情况下，将 HTML入口的改成对配置文件的读取，从而减少一次请求，如：```registerApp('App1', { html: '', scripts: ['//abc.test.com/index.js'], css: ['//abc.test.com/index.css']})```

5. 通过gulp合并amd模块的减小重复打包体积，这么多同类型的vue项目，有大量的重复代码、重复引用，可以进行优化，webpack打包后，externals配置的模块不会打包进bundle，会被摘出来按umd规范通过requre方式去加载。相关依赖可以选择尽量相同的版本

 ```
        const gulp = require('gulp');
        const concat = require('gulp-concat');
        gulp.task('storeConcat', function () {
            gulp.src('project/**/Store.js')
                .pipe(concat('Store.js')) //合并后的文件名
                .pipe(gulp.dest('project/'));
        });
 ```

 通过配置externals可以减小子项目打包出来的体积。[webpack外部扩展](https://www.webpackjs.com/configuration/externals/)
 ```
    // 每个子项目自己的webpack.config.js，根据使用情况设置externals
     externals: {
          'axios': 'axios',
          'vue': 'Vue',
          'vue-router': 'VueRouter',
          'vuex': 'Vuex',
          'moment': 'moment',
          ...
      }
```
        
通过[system.js](https://github.com/systemjs/systemjs/tree/0.21)优化资源加载
  ```
    // index.html 整个微前端的唯一入口
    <script src="system.js"></script>
    <script>
      SystemJS.config({
        map: {
          "Vue": "//xxx.cdn.cn/static/vue/2.5.17/vue.min.js",
          "Vuex": "//xxx.cdn.cn/static/vuex/3.0.1/vuex.min.js",
          "VueRouter": "//xxx.cdn.cn/static/vueRouter/3.0.1/vue-router.min.js",
          "moment": "//xxx.cdn.cn/static/moment/2.22.2/moment.min.js",
          "axios": "//xxx.cdn.cn/static/axios/0.15.3/axios.min.js",
        }
      })
    </script>
```
入口index.html只有一个，不一次性引入所有CDN资源，可能子项目A使用而B不使用导致重复引用systemjs只是在加载index.html时注册了这些CDN地址，不会直接去加载，当子项目里用到的时候，systemjs会接管模块引入，再动态去加载资源。避免不同子项多余加载。 [参考demo地址](https://github.com/joeldenning/coexisting-vue-microfrontends)

        
6. 页面切换优化性能加载，在页面切换时候依旧需要获取页面数据时，可能会在数据返回前有短暂的白屏。
    - 切换前：在确保组件&数据加载完毕前，可保证页面可交互性，路由跳转前进行拦截，数据处理后再进行跳转，减少阻塞感。如果需要重新请求就写在activated钩子里
    - 添加转场动画：组件&数据已经完全加载，在切换至新页面瞬间，依旧需要页面渲染时间，大多数页面保证在转场动画完毕之后依然渲染完毕。
    - 为了让页面切换不刷新，使用了keep-alive去缓存页面，在关闭页面时通过keep-alive的exclude属性去除了keep-alive缓存或者用include，把要换存的页面的name放在状态管理，把一些复杂重复调用接口或者没有必要缓存的模块剔除不进行keep-alive缓存
     - 由于我们的子应用加载后就不对其进行卸载，主要是处理缓存，防止堆内存溢出，还有项目间切换时路由钩子接管的处理。
        [keep-alive 缓存页面demo](https://github.com/MarioLuLu7/microfrontend-admin)


7. 让子项目使用 `stats-webpack-plugin` 插件，每次打包后都输出一个 只包含重要信息的manifest.json文件。父项目先ajax 请求 这个json文件，从中读取出需要加载的js目录，然后同步加载。

8. 借鉴qiankun 框架，路由系统基于 Single-SPA 实现，在应用的加载和管理层引入了 jsSandowBox，其他项目的css和js的我们在子应用切换时并没有去除，只能通过规范避免相互污染，或者通过[CustomEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent)来进行页面通信
  项目加载流程应该为
  ```
        浏览器访问/main/app1=>
        加载main主应用=>
        加载子应用app1=>
        请求app1config.js=>
        加载app1的相关静态资源=>
        main主应用接管路由相应路由变化=>
        main加载对应页面
```
    
在获取子应用的配置信息时，我们可以按照约定 path 的规则，Single-SPA 对应 entry js/html 配置可以减少加载。




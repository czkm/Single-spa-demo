<template>
  <a-layout id="components-layout-demo-custom-trigger">
    <a-layout-sider :trigger="null" collapsible v-model="collapsed">
      <div class="logo" />
      <a-menu theme="dark" mode="inline" :default-selected-keys="['1']">
        <a-menu-item key="1">
          <a-icon type="home" />ant_app1
          <a href="/vue-antd#"></a>
          <!-- <span class="nav-text">nav 1</span> -->
        </a-menu-item>
        <a-menu-item key="2">
          <a-icon type="user" />element_app2
          <a href="/vue-element#"></a>
          <!-- <span class="nav-text">nav 1</span> -->
        </a-menu-item>
        <!-- <a-menu theme="dark" mode="inline">
        <a-sub-menu key="1">
          <span slot="title">
            <a-icon type="user" />
            <a href="/vue-antd#">ant_app1</a>
          </span>
        </a-sub-menu>
        <a-sub-menu key="2">
          <span slot="title">
            <a-icon type="user" />
            <a href="/vue-element#">element_app2</a>
          </span>
        </a-sub-menu>-->
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0" />
      <a-layout-content
        :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }"
      >
        <div class="content">
          <!--这是右侧内容栏-->
          <div id="single-vue" class="single_spa_vue">
            <div id="vue"></div>
          </div>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  data() {
    return {
      collapsed: false
    };
  }
};
</script>
<style>
#components-layout-demo-custom-trigger {
  height: inherit;
}
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
</style>



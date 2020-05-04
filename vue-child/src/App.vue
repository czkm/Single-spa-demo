<template>
  <div class='app——child1'>
    <div id="nav">
      <router-link to="/child1">child1</router-link>|
      <router-link to="/child2">child2</router-link>
    </div>
    <router-view />
  </div>
</template>

<style>
#nav {
  padding: 30px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

</style>

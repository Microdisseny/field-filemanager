<template>
  <div id="app">
    <FileManager :apiUrl="apiUrl" :maxUploadRetries="maxUploadRetries" :default-display-mode="'list'" lang="ca"/>
    <FileManager :apiUrl="apiUrl2" :maxUploadRetries="maxUploadRetries" :default-display-mode="'grid'" lang="ca"/>
  </div>
</template>

<script>
import FileManager from './components/FileManager.vue'

export default {
  name: 'app',
  components: {
    FileManager
  },
  computed: {
    apiUrl () {
      return process.env.VUE_APP_API_URL
    },
    apiUrl2 () {
      return process.env.VUE_APP_API_URL2
    },
    maxUploadRetries () {
      return parseInt(process.env.VUE_APP_MAX_UPLOAD_RETRIES)
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

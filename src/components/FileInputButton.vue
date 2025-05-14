<template>
  <div>
    <label :for="'uploadFile-' + id" class="file-button">
      <upload-button class="upload-button-icon" />
    </label>
    <input :id="'uploadFile-' + id" type="file" ref="uploadFile" @change="onChange" multiple="multiple"
      style="display: none"/>
  </div>
</template>

<script>
import UploadButton from './../assets/upload_button.svg'

export default {
  components: {
    UploadButton
  },
  data () {
    return {
      id: null
    }
  },
  mounted () {
    this.id = this._uid
  },
  methods: {
    onChange () {
      const files = this.$refs.uploadFile.files
      this.$emit('change', Array.from(files))
    }
  }
}
</script>

<style lang="stylus">
[data-field-filemanager-style]
  .file-button {
    padding: 0;
    margin: 0;
    width: auto;
    min-width: 0;
  }

  .upload-button-icon {
    padding: 0;
    margin: 0;
    margin-top: 8px;
    margin-right: 4px;
    width: 32px;
    height: 32px;
    cursor: pointer;
  }
</style>

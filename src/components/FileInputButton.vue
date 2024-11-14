<template>
  <div>
    <label :for="id" class="file-button">
      <upload-button class="upload-button-icon" />
    </label>
    <input
      :id="id"
      type="file"
      ref="uploadFile"
      @change="onChange"
      multiple="multiple"
      style="display: none"
    />
  </div>
</template>

<script>
import UploadButton from './../assets/upload_button.svg'

export default {
  props: ['id'],
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
    width: 48px;
    height: 48px;
    cursor: pointer;
  }
</style>

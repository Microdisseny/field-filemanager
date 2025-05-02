<template>
  <div class="container">
    <div
      v-for="upload in uploads"
      :key="'upload-' + upload.name"
      class="document ie11hack"
      :class="{'error': upload.retry >= maxUploadRetries}"
      >
      <div v-if='!upload.completed && upload.uploadPercentage && upload.uploadPercentage > 0 && upload.uploadPercentage < 100'
        class="delete"
        @click="cancelUpload(upload)"
        >
        <DeleteIcon class="delete-icon" />
      </div>
      <div v-if='upload.retry >= maxUploadRetries'
        class="delete"
        @click="removeFromUploads(upload.name)"
        >
        <DeleteIcon class="delete-icon" />
      </div>
      <div class="loading" v-if='upload.uploadPercentage > 0'>
        <div
          v-if='upload.uploadPercentage < 100'
          :style="{'width':  Math.floor(upload.uploadPercentage) + '%'}"
          class="document-loading-loading"
          >
        </div>
      </div>
      <div class="icon">
        <component
          :is="getFileIcon(upload.name)"
          class="extension-icon"
        />
      </div>
      <div class="name">
          {{ upload.name }}
      </div>
    </div>
    <div
      v-for="document in documents"
      :key="'document-' + document.name"
      class="document ie11hack"
      >
      <div
        class="delete"
        @click="deleteDocument(document)"
        >
          <DeleteIcon class="delete-icon" />
      </div>
      <div class="icon">
        <a :href="document.file" target="_blank">
          <img v-if="document.thumbnail" :src="document.thumbnail">
          <component
            v-else
            :is="getFileIcon(document.name)"
            class="extension-icon"
          />
        </a>
      </div>
      <div class="name">
        <a :href="document.file" target="_blank">{{ document.name }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import DeleteIcon from './../assets/cancel.svg'
import FileInputButton from './FileInputButton.vue'
import {
  GenericFileIcon,
  PngFileIcon,
  JpgFileIcon,
  TifFileIcon,
  GifFileIcon,
  ZipFileIcon,
  PdfFileIcon,
  PptFileIcon,
  WordFileIcon,
  XlsFileIcon,
  ExeFileIcon,
  CodeFileIcon,
  getFileIcon
} from '../assets/extensions/lib.js'

export default {
  name: 'filemanager',
  components: {
    DeleteIcon,
    FileInputButton,
    GenericFileIcon,
    PngFileIcon,
    JpgFileIcon,
    TifFileIcon,
    GifFileIcon,
    ZipFileIcon,
    PdfFileIcon,
    PptFileIcon,
    WordFileIcon,
    XlsFileIcon,
    ExeFileIcon,
    CodeFileIcon
  },
  props: {
    uploads: {
      type: Array,
      required: true
    },
    documents: {
      type: Array,
      required: true
    }
  },
  methods: {
    removeFromUploads (name) {
      this.$emit('remove-from-uploads', name)
    },
    deleteDocument (document) {
      this.$emit('delete-document', document)
    },
    cancelUpload (upload) {
      this.$emit('cancel-upload', upload)
    },
    getFileIcon
  }
}
</script>

<style lang="stylus" scoped>
[data-field-filemanager-style]
  .container {
    display: flex;
    flex-wrap: wrap;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-template-rows: minmax(250px, 100px);
    grid-auto-rows: minmax(250px, auto);
    grid-gap: 20px;
    padding: 0px 20px 20px 20px;
  }
  .document {
    color: black;
    border: 1px solid #EEEEEE;
    border-radius: 10px;
    padding: 5px;
    display: flex;
    position: relative;
    flex-direction: column;

    .icon {
      width: 240px;
      height: 240px;
      padding: 0px;
      margin: auto;
      line-height: 240px;
      align-items: center;
      display: flex;
      justify-content: center;

      .extension-icon {
        width: 96px;
        height: 96px;
      }

      a {
        color: black;
        text-decoration: none;
        display: inline-flex;
      }

      img,
      svg {
        max-width: 240px;
        max-height: 240px;
        vertical-align: middle;
      }
    }

    .name {
      align-items: center;
      display: flex;
      justify-content: center;
      padding-bottom: 10px;

      a {
        color: black;
        text-decoration: none;
        display: inline-flex;
      }
    }

    .delete {
      position: absolute;
      width: 48px;
      height: 48px;
      cursor: pointer;
      top: 10px;
      right: 0px;
    }

    .loading {
      position: relative;
      border: 1px solid #EEEEEE;
      top: 0px;
      left: 0px;
      height: 4px;
      border-radius: 2px;
    }
  }

</style>

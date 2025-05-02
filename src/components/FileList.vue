<template>
  <div class="container">
    <div
      v-for="upload in uploads"
      :key="'upload-' + upload.name"
      class="document ie11hack"
      :class="{'error': upload.retry >= maxUploadRetries}"
      >
      {{ upload.uploadPercentage }}
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
      <div v-if='!upload.completed && upload.uploadPercentage && upload.uploadPercentage > 0 && upload.uploadPercentage < 100'
        class="icon clickable"
        @click="cancelUpload(upload)"
        >
        <DeleteIcon class="delete-icon" />
      </div>
      <div v-if='upload.retry >= maxUploadRetries'
        class="icon clickable"
        @click="removeFromUploads(upload.name)"
        >
        <DeleteIcon class="delete-icon" />
      </div>
    </div>
    <div
      v-for="document in documents"
      :key="'document-' + document.name"
      class="document ie11hack"
      >
      <div class="icon">
        <a :href="document.file" target="_blank">
          <component
            :is="getFileIcon(document.name)"
            class="extension-icon"
          />
        </a>
      </div>
      <div class="name">
        <a :href="document.file" target="_blank">{{ document.name }}</a>
      </div>
      <div
        class="icon clickable"
        @click="deleteDocument(document)"
        >
          <DeleteIcon class="delete-icon" />
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
    ExeFileIcon,
    CodeFileIcon,
    XlsFileIcon
  },
  props: {
    uploads: {
      type: Array,
      required: true
    },
    documents: {
      type: Array,
      required: true
    },
    maxUploadRetries: {
      type: Number,
      default: 3
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
    flex-wrap: wrap;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 250px));
    grid-template-rows: minmax(28px, 32px);
    grid-gap: 6px 20px;
    padding: 0px 20px 20px 20px;
  }
  .document {
    color: black;
    border: 1px solid #EEEEEE;
    border-radius: 10px;
    padding: 5px;
    display: flex;
    width: 100%;
    align-items: center;

    .icon {
      vertical-align: middle;
      padding: 0px;
      margin: 0px;
      line-height: 15px;
      align-items: center;
      display: flex;
      flex: 0 0 20px;
      justify-content: center;

      .extension-icon {
        width: 24px;
        height: 24px;
      }

      a {
        color: black;
        text-decoration: none;
        display: inline-flex;
      }
    }

    .name {
      flex: 1;
      overflow: hidden;
      text-align: start;

      a {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: black;
        text-decoration: none;
        display: block;
      }
    }
  }
</style>

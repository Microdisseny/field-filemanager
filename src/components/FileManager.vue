<template>
    <drop-area
        data-field-filemanager-style
        @newFiles="queueFiles">
      <div class="drop-area-title">
          <slot name="dropAreaHeader">
          <div class='col1'>&nbsp;</div>
          <div class='col2'>
            <slot name="dropAreaTitle">
              <h3>
                Upload new file
              </h3>
            </slot>
          </div>
          <file-input-button class='col3' @change="queueFiles"></file-input-button>
          </slot>
      </div>
    <div class="documents-errors">
      <div
        v-for="(error, index) in errors"
        :key="'error-'+ index"
        class="document-error-message"
        >
        <div
          class="error-delete"
          @click="removeFromErrors(index)"
          >
        <DeleteIcon class="delete-icon" />
        </div>
        <div class="error-message">{{ error }}</div>
      </div>
    </div>
    <div class="documents-container">
      <div class="documents" v-mysortable:[documents]="{onUpdate: onUpdate}">
        <div
          v-for="upload in uploads"
          :key="'upload-' + upload.name"
          class="document ie11hack"
          :class="{'error': upload.retry >= maxUploadRetries}"
          >
          <div v-if='!upload.completed && upload.uploadPercentage && upload.uploadPercentage > 0 && upload.uploadPercentage < 100'
            class="document-delete"
            @click="cancelUpload(upload)"
            >
            <DeleteIcon class="delete-icon" />
          </div>
          <div v-if='upload.retry >= maxUploadRetries'
            class="document-delete"
            @click="removeFromUploads(upload.name)"
            >
            <DeleteIcon class="delete-icon" />
          </div>
          <div class="document-loading" v-if='upload.uploadPercentage > 0'>
            <div
              v-if='upload.uploadPercentage < 100'
              :style="{'width':  Math.floor(upload.uploadPercentage) + '%'}"
              class="document-loading-loading"
              >
              </div>
            </div>
            <div class="document-image handle">
              <GenericFileImage class="generic-file-image" />
            </div>
              <div class="document-name">
                  {{ upload.name }}
              </div>
          </div>
          <div
            v-for="document in documents"
            :key="'document-' + document.name"
            class="document ie11hack"
            >
              <div
                class="document-delete"
                @click="deleteDocument(document)"
                >
                  <DeleteIcon class="delete-icon" />
              </div>
              <div class="document-image">
                <a :href="document.file" target="_blank">
                  <img v-if="document.thumbnail" :src="document.thumbnail">
                  <GenericFileImage v-else class="generic-file-image" />
                </a>
              </div>
              <div class="document-name">
                <a :href="document.file" target="_blank">{{ document.name }}</a>
              </div>
            </div>
      </div>
    </div>
    </drop-area>
</template>

<script>
import API from '../api.js'
import DeleteIcon from './../assets/cancel.svg'
import FileInputButton from './FileInputButton.vue'
import DropArea from './DropArea.vue'
import GenericFileImage from './../assets/file.svg'
import Sortable from 'vue-sortable'
import sortableDirective from './../directives/sortable.directive'
import orderBy from 'orderby'

export default {
  name: 'filemanager',
  directives: {
    sortableDirective,
    Sortable
  },
  components: {
    DropArea,
    DeleteIcon,
    FileInputButton,
    GenericFileImage
  },
  props: {
    apiUrl: {
      type: String,
      required: true
    },
    apiTimeout: {
      type: Number,
      default: 30
    },
    apiHeaders: {
      type: Object,
      required: false
    },
    maxUploadRetries: {
      type: Number,
      default: 3
    },
    maxUploads: {
      type: Number,
      default: 3
    },
    refreshEvery: {
      type: Number,
      default: 30
    }
  },
  computed: {
    orderedDocuments () {
      return orderBy(this.documents, 'name')
    }
  },
  created () {
    this.api = new API({ apiUrl: this.apiUrl, timeout: this.apiTimeout, apiHeaders: this.apiHeaders || {} })
    this.getDocuments()
    // Synchronize with server to get other users uploads
    setInterval(() => this.getDocuments(), this.refreshEvery * 1000)
    this.$on('upload-removed', upload => {
      // Remove error message related to a upload if retries are ended
      if (upload.error === true && upload.completed === true) {
        const indexError = this.errors.indexOf(upload.message)
        if (indexError > -1) {
          this.removeFromErrors(indexError, false)
        }
      }
    })
  },
  data () {
    return {
      errors: [],
      uploads: [],
      documents: [],
      uploadingFiles: 0
    }
  },
  methods: {
    onUpdate: function (event) {
      console.log('hola')
      this.documents.splice(event.newIndex, 0, this.documents.splice(event.oldIndex, 1)[0])
      console.log(this.documents)
    },
    cancelUpload (upload) {
      this.api.cancelUpload(upload)
    },
    deleteDocument (document) {
      const res = confirm('Are you sure to delete [' + document.name + ']?')
      if (res) {
        this.api.deleteFile(document.name)
          .then(data => {
            this.getDocuments()
          })
          .catch(() => {
            this.notifyError(`Error deleting ${document.name}`)
          })
      }
    },
    getDocuments () {
      this.api.listFiles()
        .then(data => {
          if (Array.isArray(data)) {
            this.documents = data
          } else {
            this.notifyError('Error retrieving documents from server')
          }
        })
        .catch(() => {
          this.notifyError('Error retrieving documents from server')
        })
    },
    queueFiles (files) {
      // Validate
      const exists = files.some((file) => {
        return this.uploads.findIndex(upload => upload['name'] === file['name']) !== -1
      })
      if (exists) {
        alert('ERROR: Some files are pending to upload or uploading')
      } else {
        // Queue
        files.forEach(file => {
          const uploadInfo = {
            file: file,
            name: file.name,
            message: `Uploading ${file.name}`,
            uploadPercentage: null,
            completed: false,
            error: false,
            retry: 0
          }
          this.uploads.push(uploadInfo)
        })
        this.workerCheck()
      }
    },
    notifyError (error) {
      const index = this.errors.indexOf(error)
      if (index !== -1) {
        this.errors.splice(index, 1)
      }
      this.errors.unshift(error)
    },
    uploadFile (uploadInfo) {
      this.uploadingFiles += 1
      this.api.uploadFile(uploadInfo)
        .then((data) => {
          uploadInfo.completed = true
          uploadInfo.message = `Completed ${uploadInfo.name}`
          this.removeFromUploads(uploadInfo.name)
          const indexDocument = this.documents.findIndex(document => document['name'] === uploadInfo.name)
          if (indexDocument > -1) {
            this.documents[indexDocument] = data
          } else {
            this.documents.push(data)
          }
          this.uploadingFiles -= 1
          this.getDocuments()
          this.workerCheck()
        })
        .catch(error => {
          if (error.error === 'canceled') {
            this.removeFromUploads(uploadInfo.name)
            return
          }
          if (uploadInfo.retry >= this.maxUploadRetries) {
            uploadInfo.completed = true
          }
          uploadInfo.message = `Error uploading ${uploadInfo.name}`
          uploadInfo.error = true
          uploadInfo.uploadPercentage = null
          this.notifyError(uploadInfo.message)
          this.uploadingFiles -= 1
          this.workerCheck()
        })
    },
    removeFromUploads (name, trigger = true) {
      const indexUpload = this.uploads.findIndex(upload => upload.name === name)
      if (indexUpload !== -1) {
        const upload = this.uploads[indexUpload]
        this.uploads.splice(indexUpload, 1)
        if (trigger) {
          this.$emit('upload-removed', upload)
        }
      }
    },
    removeFromErrors (index, trigger = true) {
      this.errors.splice(index, 1)
    },
    workerCheck () {
      let i
      for (i in this.uploads) {
        if (this.uploadingFiles >= this.maxUploads) {
          break
        }
        let uploadInfo = this.uploads[i]
        if (uploadInfo.completed === false && uploadInfo.uploadPercentage === null) {
          if (uploadInfo.error) {
            uploadInfo.error = false
            uploadInfo.retry += 1
          }
          uploadInfo.uploadPercentage = 0
          this.uploadFile(uploadInfo)
        }
      }
    }
  }
}
</script>
<style>
_:-ms-fullscreen, :root .ie11hack {
  margin: 0 0 20px 20px;
}
</style>
<style lang="stylus">
[data-field-filemanager-style]
  .drop-area-title {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-gap: 10px;
    color: #2c3e50;
  }

  .drop-area-title h3 {
    font-size: 1.17em;
    font-weight: bold;
  }

  .drop-area-title .col3 {
    text-align: right;
  }

  .documents-errors {
    color: red;
    text-align: left;
    padding-left: 20px;
    padding-right: 20px;
    display: table;
  }

  .error-delete {
    display: table-cell;
    cursor: pointer;
    vertical-align: middle;
  }

  .error-delete svg {
    fill: red;
  }

  .error-message {
    display: table-cell;
    vertical-align: middle;
    padding-left: 10px;
  }

  .documents-container {
    min-height: 400px;
  }

  .documents {
    display: flex;
    flex-wrap: wrap;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-template-rows: minmax(250px, auto);
    grid-auto-rows: minmax(250px, auto);
    grid-gap: 20px;
    padding: 20px;
  }

  .document {
    color: black;
    border: 1px solid #EEEEEE;
    border-radius: 10px;
    padding: 5px;
    display: inline-block;
    position: relative;
  }

  .document.error .document-name {
    color: red !important;
  }

  .document-name {
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .document-name a {
    color: black;
    text-decoration: none;
    display: inline-flex;
  }

  .document-image {
    width: 240px;
    height: 240px;
    padding: 0px;
    margin: auto;
    line-height: 240px;
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .document-image a {
    color: black;
    text-decoration: none;
    display: inline-flex;
  }

  .document-image img,
  .document-image svg {
    max-width: 240px;
    max-height: 240px;
    vertical-align: middle;
  }

  .document-delete {
    position: absolute;
    width: 48px;
    height: 48px;
    cursor: pointer;
    top: 10px;
    right: 0px;
  }

  .document-loading {
    position: relative;
    border: 1px solid #EEEEEE;
    top: 0px;
    left: 0px;
    height: 4px;
    border-radius: 2px;
  }

  .document-loading-loading {
    position: absolute;
    background-color: blue;
    width: 0%;
    height: 4px;
    border-radius: 2px;
  }

  .generic-file-image {
    width: 96px;
    height: 96px;
  }

  .delete-icon {
    width: 24px;
    height: 24px;
  }
</style>

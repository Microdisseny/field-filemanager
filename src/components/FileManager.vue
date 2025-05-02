<template>
    <drop-area
        data-field-filemanager-style
        @newFiles="queueFiles">
      <div class="drop-area-title">
        <slot name="dropAreaHeader">
          <div class='col1 menu'>
            <span v-if="displayMode == 'grid'" @click="setListMode" :title="t('show_list_title')">
              <ListIcon class="menu-icon clickable"></ListIcon>
            </span>
            <span v-if="displayMode == 'list'" @click="setGridMode" :title="t('show_grid_title')">
              <GridIcon class="menu-icon clickable"></GridIcon>
            </span>
          </div>
          <div class='col2'>
            <slot name="dropAreaTitle">
              <h3>
                Upload new file
              </h3>
            </slot>
          </div>
          <file-input-button class='col3' @change="queueFiles" :title="t('upload_file_title')"></file-input-button>
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
      <component
        :is="displayMode == 'grid' ? 'file-grid' : 'file-list'"
        :uploads="uploads"
        :documents="documents"
        :max-upload-retries="maxUploadRetries"
        @delete-document="deleteDocument"
        @cancel-upload="cancelUpload"
        @remove-from-uploads="removeFromUploads"
      />
    </div>
    </drop-area>
</template>

<script>
import orderBy from 'orderby'
import API from '../api.js'
import DropArea from './DropArea.vue'
import FileInputButton from './FileInputButton.vue'
import FileGrid from './FileGrid.vue'
import FileList from './FileList.vue'
import ListIcon from './../assets/list.svg'
import GridIcon from './../assets/grid.svg'
import messages from '../i18n'

export default {
  name: 'filemanager',
  components: {
    DropArea,
    FileGrid,
    FileInputButton,
    FileList,
    ListIcon,
    GridIcon
  },
  props: {
    defaultDisplayMode: {
      type: String,
      default: 'list' // 'list' or 'grid'
    },
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
    },
    lang: {
      type: String,
      default: 'en'
    }
  },
  computed: {
    orderedDocuments () {
      return orderBy(this.documents, 'name')
    }
  },
  created () {
    this.$t = messages(this.lang)
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
      api: null,
      errors: [],
      uploads: [],
      documents: [],
      uploadingFiles: 0,
      displayMode: this.defaultDisplayMode
    }
  },
  methods: {
    t (key) {
      return this.$t(key)
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
    },
    setGridMode () {
      this.displayMode = 'grid'
    },
    setListMode () {
      this.displayMode = 'list'
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
    min-height: 100px;
    max-height: 500px;
    overflow: auto;
  }

  .document.error .document-name {
    color: red !important;
  }

  .document-loading-loading {
    position: absolute;
    background-color: blue;
    width: 0%;
    height: 4px;
    border-radius: 2px;
  }

  .delete-icon {
    width: 24px;
    height: 24px;
  }

  .menu {
    display: flex;
    margin: 10px 0px 0px 10px;
  }

  .menu-icon {
    width: 24px;
    height: 24px;
  }

  .clickable {
    cursor: pointer;
  }

  .document:hover {
    border: 1px solid black;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.4);
    background-color: #F5F5F5;
  }
</style>

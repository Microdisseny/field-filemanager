import axios from 'axios'
import urljoin from 'url-join'

export default {
  apiUrl: '',
  apiTimeout: 30 * 1000,
  apiHeaders: {},
  config (config) {
    this.apiUrl = config.apiUrl
    if ('apiTimeout' in config) {
      this.apiTimeout = config.apiTimeout * 1000
    }
    if ('apiHeaders' in config) {
      this.apiHeaders = config.apiHeaders
    }
  },
  cancelUpload (uploadInfo) {
    if (uploadInfo.name in this.cancelUploadTokens) {
      this.cancelUploadTokens[uploadInfo.name].cancel()
    }
  },
  cancelUploadTokens: {},
  listFiles () {
    return new Promise((resolve, reject) => {
      const config = {
        headers: this.apiHeaders
      }
      axios.get(this.apiUrl, config)
        .then(response => {
          resolve(response.data)
        })
        .catch(thrown => {
          const error = { error: 'error', rawerror: thrown }
          reject(error)
        })
    })
  },
  uploadFile (uploadInfo) {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    return new Promise((resolve, reject) => {
      const config = {
        timeout: this.apiTimeout,
        headers: this.apiHeaders,
        onUploadProgress: (progressEvent) => {
          uploadInfo.uploadPercentage = (progressEvent.loaded * 100) / progressEvent.total
        },
        cancelToken: source.token
      }
      this.cancelUploadTokens[uploadInfo.name] = source
      const formData = new FormData()
      formData.append('file', uploadInfo.file)
      axios.post(this.apiUrl, formData, config)
        .then(response => {
          resolve(response.data)
        })
        .catch(thrown => {
          let error = { error: 'error', rawerror: thrown }
          if (axios.isCancel(thrown)) {
            error.error = 'canceled'
          }
          reject(error)
        })
        .then(() => {
          if (uploadInfo.name in this.cancelUploadTokens) {
            delete this.cancelUploadTokens[uploadInfo.name]
          }
        })
    })
  },
  deleteFile (fileName) {
    return new Promise((resolve, reject) => {
      const url = urljoin(this.apiUrl, fileName)
      const config = {
        headers: this.apiHeaders
      }
      axios.delete(url, config)
        .then(response => {
          resolve(response.data)
        })
        .catch(thrown => {
          const error = { error: 'error', rawerror: thrown }
          reject(error)
        })
    })
  }
}

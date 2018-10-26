import axios from 'axios'
import urljoin from 'url-join'

export default {
  apiUrl: '',
  apiTimeout: 30 * 1000,
  config (config) {
    this.apiUrl = config.apiUrl
    if ('apiTimeout' in config) {
      this.apiTimeout = config.apiTimeout * 1000
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
      axios.get(this.apiUrl)
        .then(response => {
          resolve(response.data)
        })
        .catch(thrown => {
          const error = { error: 'error', rawError: thrown }
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
        headers: {},
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
          let error = { error: 'error', rawError: thrown }
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
      axios.delete(url)
        .then(response => {
          resolve(response.data)
        })
        .catch(thrown => {
          const error = { error: 'error', rawError: thrown }
          reject(error)
        })
    })
  }
}

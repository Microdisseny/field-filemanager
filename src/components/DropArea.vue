<template>
  <div class="drop-area"
      :class="{'drag-over': isOver}"
      @dragenter.prevent='onDragEnter'
      @dragleave.prevent='onDragLeave'
      @dragover.prevent='onDragOver'
      @drop.prevent='onDrop'>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dragEnterCounter: 0
    }
  },
  computed: {
    isOver () {
      return this.dragEnterCounter > 0
    }
  },
  methods: {
    // https://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree/44918780#44918780
    getFilesWebkitDataTransferItems (dataTransferItems) {
      function traverseFileTreePromise (item, path = '') {
        return new Promise(resolve => {
          if (item.isFile) {
            item.file(file => {
              file.filepath = path + file.name // save full path
              files.push(file)
              resolve(file)
            })
          } else if (item.isDirectory) {
            let dirReader = item.createReader()
            dirReader.readEntries(entries => {
              let entriesPromises = []
              for (let entr of entries) {
                entriesPromises.push(traverseFileTreePromise(entr, path + item.name + '/'))
              }
              resolve(Promise.all(entriesPromises))
            })
          }
        })
      }

      let files = []
      return new Promise((resolve, reject) => {
        let entriesPromises = []
        for (let it of dataTransferItems) {
          if (it.kind === 'file') {
            entriesPromises.push(traverseFileTreePromise(it.webkitGetAsEntry()))
          }
        }
        Promise.all(entriesPromises)
          .then(entries => {
            resolve(files)
          })
      })
    },
    onDrop (event) {
      this.dragEnterCounter = 0
      const items = event.dataTransfer.items
      this.getFilesWebkitDataTransferItems(items)
        .then(files => {
          this.$emit('newFiles', Array.from(files))
        })
        .catch(() => {
          const files = event.dataTransfer.files
          this.$emit('newFiles', Array.from(files))
        })
    },
    onDragEnter () {
      this.dragEnterCounter++
    },
    onDragLeave () {
      this.dragEnterCounter--
    },
    onDragOver () {}
  }
}
</script>
<style lang="stylus">
[data-field-filemanager-style]
  &.drop-area {
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  &.drop-area.drag-over {
    border: 1px solid #129d57;
    background-color: #129d5706;
    color: #129d57;
  }
</style>

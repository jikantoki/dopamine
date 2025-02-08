<template lang="pug">
  v-card(title="追加").folder-picker-main
    .current-directory
      p 検索中: {{ currentDirectory }}
      button(
        @click="changeDir(undefined,true)"
        v-ripple
        :disabled="currentDirectory == ''"
      ) 戻る
    .view-folders
      .folder(v-for="(folder, folderIndex) in viewFolders")
        button(
          v-ripple
          @click="changeDir(folder.name)"
        ) {{ folder.name }} {{ folder }}
</template>

<script>
import { Filesystem, Directory } from '@capacitor/filesystem'
import { AndroidSettings, NativeSettings } from 'capacitor-native-settings'

export default {
  data() {
    return {
      /** 表示するフォルダー */
      viewFolders: [],
      currentDirectory: '',
    }
  },
  methods: {
    /**
     * 指定ディレクトリのファイル一覧を取得
     * @param {string} [path=''] このディレクトリ以下を探す
     */
    async searchDir(path = '') {
      const dir = await Filesystem.readdir({
        directory: Directory.ExternalStorage,
        path: path,
      })
      return dir.files
    },
    /**
     * 検索対象のディレクトリ変更
     * @param {string} [path=''] このディレクトリ以下を探す
     * @param {boolean} [backFlag=false] Trueなら一つ戻る
     */
    async changeDir(path, backFlag = false) {
      if (backFlag) {
        const current = this.currentDirectory.split('/')
        const length = current.length
        let newPath = ''
        current.forEach((word, index) => {
          if (index && index != length - 1) {
            newPath += `/${word}`
          }
        })
        this.currentDirectory = newPath
        this.viewFolders = await this.searchDir(this.currentDirectory)
      } else {
        this.currentDirectory += `/${path}`
        this.viewFolders = await this.searchDir(this.currentDirectory)
      }
    },
  },
  async mounted() {
    NativeSettings.openAndroid({
      option: AndroidSettings.ApplicationDetails,
    })
    await Filesystem.requestPermissions()
    this.viewFolders = await this.searchDir('')
    console.log(this.viewFolders)
  },
}
</script>

<style lang="scss" scoped>
.folder-picker-main {
}
</style>

<template lang="pug">
  v-card.permission-settings(
    v-show="viewPermissionSettings"
    title="権限が必要です"
  ).folder-picker-main
    v-card-text メディアファイルにアクセスするために、設定から権限を許可してください
    v-card-text.py-4 Step {{ currentAllowPermissionPhotos + 1 }}
    img(
      style="height: 320px;align-self: center;"
      :src="allowPermissionPhotos[currentAllowPermissionPhotos]"
    )
    v-btn.mt-4(
      size="x-large"
      @click="openSettings"
    ) 設定を開く
    v-btn(
      size="large"
      @click="viewPermissionSettings = false"
    ) 許可しました
    v-btn.mb-4(
      size="large"
      @click="close"
    ) 今は辞めとく
  v-card.permission-settings(
    v-show="!viewPermissionSettings"
    title="ファイル追加"
    style="font-size: 1.3em;"
  ).folder-picker-main
    .current-directory
      p 音楽ファイルがあるフォルダーを選択してください
      p 選択したフォルダーの最下層ファイルまで、自動でプレイリストに追加します
      p 検索中: {{ currentDirectory }}
      v-btn(
        @click="changeDir(undefined,true)"
        v-ripple
        :disabled="currentDirectory == '' || loading"
        icon="mdi-keyboard-backspace"
        size="large"
      )
      v-btn(
        @click="reload"
        v-ripple
        icon="mdi-reload"
        size="large"
        :disabled="loading"
      )
    .view-folders(
      style="height: 50vh;overflow: auto;"
    )
      .folder(
        v-for="(folder, folderIndex) in viewFolders"
        :style="loading ? 'pointer-events: none; opacity: 0.5;' : ''"
      )
        button.pa-2(
          style="width: 100%;text-align: left;display: flex;overflow: hidden;"
          :disabled="folder.type != 'directory'"
          :v-ripple="folder.type != 'directory'"
          @click="changeDir(folder.name)"
        )
          v-icon(v-if="folder.type == 'directory' && folder.name == 'Music'") mdi-music
          v-icon(v-else-if="folder.type == 'directory'") mdi-folder
          v-icon(v-else-if="folder.name.slice(-4) == '.mp3'") mdi-music
          v-icon(v-else-if="folder.name.slice(-4) == '.wav'") mdi-music
          v-icon(v-else) mdi-file
          p.ml-2(style="white-space: nowrap;") {{ folder.name }}
      .allow-permission(v-show="!viewFolders.length")
        p もしファイルがあるのに表示されない場合は、アクセス権限が許可されていない可能性があります
        p メディアファイルにアクセスするために、設定から権限を許可してください
        v-btn.mt-4(
          size="x-large"
          @click="openSettings"
          style="display:block;margin:auto;"
        ) 設定を開く
    .buttons
      v-btn.my-2(
        size="x-large"
        style="display: block; width: 100%;"
        @click="useDirectory(currentDirectory)"
        :loading="loading"
      ) このディレクトリを使う
</template>

<script>
import { Filesystem, Directory } from '@capacitor/filesystem'
import { AndroidSettings, NativeSettings } from 'capacitor-native-settings'

export default {
  data() {
    return {
      /** 表示するフォルダー */
      viewFolders: [],
      /** 現在のディレクトリ */
      currentDirectory: '',
      /** 権限許可を表示するか？ */
      viewPermissionSettings: true,
      allowPermissionPhotos: [
        '/assets/allow-permission/step1.jpg',
        '/assets/allow-permission/step2.jpg',
      ],
      currentAllowPermissionPhotos: 0,
    }
  },
  props: {
    /** 読み込み中表示フラグ */
    loading: {
      type: Boolean,
      default: false,
    },
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
    /** 同じディレクトリのファイルを再検索 */
    async reload() {
      this.viewFolders = await this.searchDir(this.currentDirectory)
    },
    /** Androidの設定画面を開く */
    openSettings() {
      NativeSettings.openAndroid({
        option: AndroidSettings.ApplicationDetails,
      })
      this.viewPermissionSettings = false
    },
    /** データを保存せずにダイアログをクローズ */
    close() {
      this.$emit('close')
    },
    useDirectory(currentDirectory) {
      this.$emit('addPlaylist', currentDirectory)
    },
  },
  async mounted() {
    setInterval(() => {
      if (this.currentAllowPermissionPhotos) {
        this.currentAllowPermissionPhotos = 0
      } else {
        this.currentAllowPermissionPhotos = 1
      }
    }, 1000)
    this.viewFolders = await this.searchDir('')
  },
}
</script>

<style lang="scss" scoped>
.folder-picker-main {
}
</style>

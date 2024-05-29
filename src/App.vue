<script setup lang="ts" name="App">
import { provide} from "vue";
import Editor from "@/views/editor/index.vue";
import registerConfig from "@/helper/editor-config";

provide("config", registerConfig);
</script>

<template>
  <div class="app-wrapper">
    <Editor/>
  </div>
</template>

<style scoped lang="scss">

</style>

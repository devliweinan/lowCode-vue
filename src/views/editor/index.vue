<script lang="tsx" setup name="Editor">
import { computed, ref } from 'vue';
import EditorBlock from "@/views/editor/components/editor-block";
import EditorMaterial from "@/views/editor/components/editor-material";
import { BlocksAttribute, EditorBlockVO, OpreationButton } from '@/views/editor/types';
import data from "@/data/editorData.json";
import useDataFocus from '@/views/editor/useDataFocus';
import useBlockDragger from '@/views/editor/useBlockDragger';
import useCommand from './useCommand';
const state = ref<EditorBlockVO>(data);
const editorContentRef = ref<HTMLDivElement>();
const containerStyle = computed(()=> {
  return {
    width: state.value.container.width + "px",
    height: state.value.container.height + "px"
  }
});

// 实现组件的单选和多选,预留选中后的回调（拖动组件功能）
const { focusData, lastSelectedBlock, clearBlockFocus, handlerBlockMousedown } = useDataFocus(state, (event: MouseEvent) => {
  handlerAfterMousedown(event);
});

// 实现单选和多选组件的拖拽移动,创建辅助线
const { handlerAfterMousedown, markLine} = useBlockDragger(focusData, lastSelectedBlock, state.value.container);

// 拖拽添加组件
function handlerAddBlocks(record: BlocksAttribute) {
  state.value.blocks = [
    ...state.value.blocks,
    record
  ]
};
// 拖拽添加组件后需要居中位置更新
function handlerUpdateBlocks(record: BlocksAttribute) {
  state.value.blocks.forEach((block, index)=>{
    if(record.id === block.id) {
      state.value.blocks[index] = record;
    }
  })
};


const { commands } = useCommand(state);

// // 撤销
// function handlerRevoke() {
//   console.log("撤销");
// }

// // 重做
// function handlerRedo() {
//   console.log("重做");
// } 
// 操作按钮
const buttons: OpreationButton[] = [
 {key: "revoke", label: "撤销", type: "danger",  icon: "icon-revoke", handler: commands.revoke},
 {key: "redo", label: "重做", type: "primary", icon: "icon-redo", handler: commands.redo},
];

</script>

<template>
  <div class="page-container editor">
    <div class="editor-top">
      <div class="opreation-wrapper">
        <template v-for="button in buttons" :key="button.key">
          <el-button :type="(button.type as any)" @click="button.handler">{{ button.label }}</el-button>
        </template>
      </div>
    </div>
    <div class="editor-left">
      <EditorMaterial :content="editorContentRef!" :update="handlerAddBlocks" />
    </div>
    <div class="editor-right">
    </div>
    <div class="editor-center">
      <div class="editor-center-wrapper">
        <div 
          class="editor-center-wrapper_content" 
          :style="containerStyle"
          @mousedown="clearBlockFocus"
          ref="editorContentRef">
          <template v-for="(block, index) in state.blocks" :key="block.id">
            <EditorBlock class="editor-block" :class="block.focus ? 'editor-block-focus': ''" @mousedown="handlerBlockMousedown($event, block, index)" :block="block" :update="handlerUpdateBlocks"/>
          </template>
          <div v-show="markLine.x || markLine.x === 0" class="line-x" :style="{left: markLine.x + 'px'}"></div>
          <div v-show="markLine.y || markLine.y === 0" class="line-y" :style="{top: markLine.y + 'px'}"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin editor-lr {
  width: 270px;
  position: absolute;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  border: 1px solid #ccc;
}

@mixin editor-tb {
  border: 1px solid #ccc;
  width: calc(100% - 560px);
  margin: 0 auto;
}

.editor{
  width: 100%;
  height: 100vh;
  position: relative;
  &-left, &-right{
    @include editor-lr;
  }
  &-left{
    left: 0;
  }
  &-right {
    right: 0;
  }
  &-top, &-center {
    @include editor-tb;
  }
  &-top {
    height: 80px;
    .opreation-wrapper{
      width: 100%;
      padding: 10px 20px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  &-center {
    margin-top: 20px;
    height: calc(100% - 120px);
    &-wrapper {
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 0px 40px;
      
      &_content {
        border: 1px dotted #ccc;
        margin: 0 auto;
        margin-top: 40px;
        position: relative;
        .editor-block {
          position: absolute;
          &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
        }
        .editor-block-focus {
          &::after {
            border: 1px dotted red;
          }
        }
        .line-x {
          position: absolute;
          top: 0;
          bottom: 0;
          border-left: 1px dotted red;
          z-index: 20;
        }
        .line-y {
          position: absolute;
          left: 0;
          right: 0;
          border-top: 1px dotted red;
          z-index: 20;
        }
      }
    }
  }
}
</style>



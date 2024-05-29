import { Ref, computed, ref } from "vue";
import { BlocksAttribute, EditorBlockVO, FocusData } from "@/views/editor/types";
/**
 * 实现组件的单选和多选,并选中后拖动的功能
 * @param state 
 * @param callback 选中移动时候触发的回调函数
 * @returns 
 */
export default function useDataFocus(state: Ref<EditorBlockVO>, callback: (event: MouseEvent)=>void) {
  
  // -1 表示没有任何一个选中 （用于添加辅助线）
  const selectedIndex = ref(-1);

  const lastSelectedBlock = computed(() => {
    const result = selectedIndex.value !== -1 ? state.value.blocks[selectedIndex.value] : undefined;
    return result;
  });

  // 计算选中和未选中的数据
  const focusData = computed<FocusData>(() => {
    const focus: FocusData["focus"] = [];
    const unfocus: FocusData["unfocus"] = [];
    state.value.blocks.forEach(block=>{
      block.focus ? focus.push(block) : unfocus.push(block);
    });
    return { focus, unfocus }
  });

  function clearBlockFocus() {
    if(selectedIndex.value === -1) return;
    state.value.blocks.forEach(item=>{
      if(item.focus) item.focus = false;
    })
    selectedIndex.value = -1;
  };

  // 实现拖拽多个组件
  function handlerBlockMousedown(event: MouseEvent, block: BlocksAttribute, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if(!event.shiftKey) {
      if(!block.focus) {
        clearBlockFocus();
        block.focus = true;
        selectedIndex.value = index;
      } else {
        block.focus = false;
        selectedIndex.value = -1;
      }  
    } else {
      block.focus = !block.focus;
      selectedIndex.value = index;
    }
    callback(event);
  };
  return { focusData, lastSelectedBlock, clearBlockFocus, handlerBlockMousedown}
}
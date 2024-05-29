import { ComputedRef, reactive, watch } from "vue";
import { BlocksAttribute, ContainerAttribute, FocusData } from "@/views/editor/types";
import emitter from "@/helper/mitt";

interface DragState {
  startX: number;
  startY: number;
  dragging: boolean;
  startLeft?: number;
  startTop?: number;
  startPos: {top: number; left: number}[]
  lines?: {
    y: {showTop: number; top: number}[];
    x: {showLeft: number, left: number}[];
  };
}

interface MarkLine {
  x: number | null; 
  y: number | null
}

export default function useBlockDragger(focusData:ComputedRef<FocusData>, lastSelectedBlock: ComputedRef<BlocksAttribute | undefined>, container: ContainerAttribute) {
  const markLine = reactive<MarkLine>({
    x: null,
    y: null,
  });

  const dragState: DragState = {
    startX: 0,
    startY: 0,
    dragging: false,
    startPos: [],
  }

  watch(lastSelectedBlock, changeLastSelectedBlock);

  function changeLastSelectedBlock(block: BlocksAttribute | undefined) {
    if(!block) {
      dragState.startLeft = undefined;
      dragState.startTop = undefined;
      dragState.lines = undefined;
      markLine.x = null;
      markLine.y = null;
      return;
    };
    const {width:lastWidth, height: lastHeight, top, left} = block;
    dragState.startLeft = left;
    dragState.startTop = top;
    dragState.dragging = false;
    dragState.lines = (() => {
      const { unfocus } = focusData.value;
      let lines: DragState["lines"] = {x: [], y: []};
      [...unfocus, {top:0, left:0, width: container.width, height: container.height}].forEach(block => {
        const {top: targetTop, left: targetLeft, width: targetWidth, height: targetHeight} = block;
        lines.y.push({showTop: targetTop, top: targetTop}); // 顶对顶
        lines.y.push({showTop: targetTop, top: targetTop - lastHeight!}); // 顶对底
        lines.y.push({showTop: targetTop + targetHeight! / 2, top: targetTop + targetHeight! / 2 - lastHeight! / 2}); // 中对中
        lines.y.push({showTop: targetTop + targetHeight!, top: targetTop + targetHeight!}); // 底对顶
        lines.y.push({showTop: targetTop + targetHeight!, top: targetTop + targetHeight! - lastHeight!}); // 底对底

        lines.x.push({showLeft: targetLeft, left: targetLeft}); // 左对左
        lines.x.push({showLeft: targetLeft + targetWidth!, left: targetLeft + targetWidth!}); // 右对左
        lines.x.push({showLeft: targetLeft + targetWidth! / 2, left: targetLeft + targetWidth! / 2 - lastWidth! / 2}); // 中对中
        lines.x.push({showLeft: targetLeft + targetWidth!, left: targetLeft + targetWidth! - lastWidth!}); // 右对右
        lines.x.push({showLeft: targetLeft, left: targetLeft - lastWidth!}); // 左对右
      })
      return lines;
    })()
  }
  function handlerGlobalMouseup() {
    if(dragState.dragging) {
      dragState.dragging = false;
      emitter.emit("dragEnd");
    }
    document.removeEventListener("mousemove", handlerGlobalMousemove);
    document.removeEventListener("mouseup", handlerGlobalMouseup);
    
  }

  function handlerGlobalMousemove(event: MouseEvent) {
    let {clientX: moveX, clientY: moveY} = event;
    if(!dragState.dragging && lastSelectedBlock.value) {
      dragState.dragging = true;
      emitter.emit("dragStart"); // 触发事件，记录拖拽前的位置信息。
    }
    // 计算当前元素最新的left和top去线里面查找，显示辅助线
    const left = moveX - dragState.startX + dragState.startLeft!; // 鼠标移动后的left值 - 鼠标移动前的left值 + 元素当前的left值  
    const top = moveY - dragState.startY + dragState.startTop!;

    // 先计算横线，距离参照物元素还有5px的时候显示辅助线,并贴边
    let showlineY: MarkLine["y"] = null; // 横向辅助线需要展示的位置
    if(!dragState.lines) return ;
    for(let i = 0; i < dragState.lines.y.length; i++) {
      const linesYInfo =  dragState.lines.y[i];
      if(Math.abs(linesYInfo.top - top) <= 5) {
        showlineY = linesYInfo.showTop;
        moveY = dragState.startY - dragState.startTop! + linesYInfo.top;
        break;
      }
    }

    let showlineX: MarkLine["x"] = null; // 纵向辅助线需要展示的位置
    for(let i = 0; i < dragState.lines.x.length; i++) {
      const linesXInfo =  dragState.lines.x[i];
      if(Math.abs(linesXInfo.left - left) <= 5) {
        showlineX = linesXInfo.showLeft;
        moveX = dragState.startX - dragState.startLeft! + linesXInfo.left;
        break;
      }
    }

    markLine.x = showlineX;
    markLine.y = showlineY;

    const distanceX = moveX - dragState.startX;
    const distanceY = moveY - dragState.startY;
    // 统一给选中的组件赋值
    focusData.value.focus.forEach((block, index) => {
      block.top = dragState.startPos[index].top + distanceY;
      block.left = dragState.startPos[index].left + distanceX;
    })
  }
  function handlerAfterMousedown(event: MouseEvent) {
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.startPos = focusData.value.focus.map(({left, top}) => ({left, top}));
    document.addEventListener("mousemove", handlerGlobalMousemove);
    document.addEventListener("mouseup", handlerGlobalMouseup);
  }

  return {
    markLine,
    handlerAfterMousedown
  }
}
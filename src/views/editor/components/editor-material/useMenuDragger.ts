import { RegisterConfigRecord } from "@/helper/editor-config";
import emitter from "@/helper/mitt";
import { BlocksAttribute } from "@/views/editor/types";

export function useMenuDragger(targetDom: HTMLDivElement, update: (payload: BlocksAttribute) => void) {
  let currentComponent: RegisterConfigRecord | null = null
  // 进入目标容器
  function handlerTargetDragenter(event: DragEvent) {
    event.dataTransfer && (event.dataTransfer.dropEffect = "move");
  }
  // 在目标容器中经过，需要阻止默认行为
  function handlerTargetDragover(event: DragEvent) {
    event.preventDefault();
  }

  // 离开目标容器 需要增加一个禁用标识
  function handlerTargetDragleave(event: DragEvent) {
    event.dataTransfer && (event.dataTransfer.dropEffect = "none");
  }
  // 松开拖拽元素， 根据拖拽组件新增
  function handlerTargetDrop(event: DragEvent) {
    const id = new Date().getTime() + currentComponent!.key
    update({
      top: event.offsetY,
      left: event.offsetX,
      key: currentComponent!.key,
      alginCenter: true,
      zIndex: 1,
      id
    })
    currentComponent = null;
  }

  function handlerDragstart(component: RegisterConfigRecord) {
    currentComponent = component;
    targetDom?.addEventListener("dragenter", handlerTargetDragenter);
    targetDom?.addEventListener("dragover", handlerTargetDragover);
    targetDom?.addEventListener("dragleave", handlerTargetDragleave);
    targetDom?.addEventListener("drop", handlerTargetDrop);
    emitter.emit("dragStart")
  }

  function handlerDragEnd() {
    targetDom?.removeEventListener("dragenter", handlerTargetDragenter);
    targetDom?.removeEventListener("dragover", handlerTargetDragover);
    targetDom?.removeEventListener("dragleave", handlerTargetDragleave);
    targetDom?.removeEventListener("drop", handlerTargetDrop);
    emitter.emit("dragEnd")
  }

  return {
    handlerDragstart,
    handlerDragEnd
  }
}
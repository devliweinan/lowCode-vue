import { inject } from 'vue';
import { EditorConfig } from '@/helper/editor-config';
import { BlocksAttribute } from '@/views/editor/types';
import styleScss from "@/views/editor/components/editor-material/index.module.scss"
import { useMenuDragger } from '@/views/editor/components/editor-material/useMenuDragger';

interface EditorMaterialProps {
  content: HTMLDivElement,
  update: (payload: BlocksAttribute) => void
}

export default function EditorMaterial({ content: targetDom, update }: EditorMaterialProps) {
  const { componentList } = inject<EditorConfig>("config")!;

  // 实现菜单拖拽功能
  const { handlerDragstart, handlerDragEnd } = useMenuDragger(targetDom, update)

  return (<div class={styleScss["material-list"]}>
    { componentList.map(component => {
      return (<div 
        class={styleScss["material-item"]} 
        onDragstart={()=>handlerDragstart(component)}
        onDragend={handlerDragEnd}
        draggable>
        <div class={styleScss["material-item-label"]}>{ component.label }</div>
        <div class={styleScss["material-item-preview"]}>{ component.preview() }</div>
        <div class={styleScss["material-item-mask"]}></div>
      </div>)
    }) }
  </div>)
}
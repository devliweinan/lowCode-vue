import { computed, defineComponent, inject, onMounted, PropType, ref } from "vue";
import { BlocksAttribute } from "@/views/editor/types";
import { EditorConfig } from "@/helper/editor-config";

interface UpdateCenterBlockData {
  (payload: BlocksAttribute): void;
}

export default defineComponent({
  name: "EditorBlock",
  props: {
    block: {
      type: Object as PropType<BlocksAttribute>,
      required: true,
      default: () => []
      // type : Object as ()=> BlocksAttribute
    },
    update: {
      type: Function as PropType<UpdateCenterBlockData>,
      required: true
    }
  },
  setup(props) {
    const config = inject<EditorConfig>("config")!;
    const blockRef = ref<HTMLDivElement>();
    const blockStyle = computed(() => {
      return {
        top: `${props.block.top}px`,
        left: `${props.block.left}px`,
        zIndex: `${props.block.zIndex}`,
      }
    })

    onMounted(() => {
      let {offsetWidth, offsetHeight} = blockRef.value!;
      const {alginCenter, ...payload} = props.block;
      payload.width = offsetWidth;
      payload.height = offsetHeight;
      if(alginCenter) {
        payload.top = props.block.top - offsetHeight / 2;
        payload.left = props.block.left - offsetWidth / 2;
      }
      props.update(payload);
    })
    
    return () => {
      const component = config.componentMap[props.block.key];
      const RenderComponent = component.render();
      return (<div ref={blockRef} style={blockStyle.value}>
        {RenderComponent}
      </div>)
    };
  }
})

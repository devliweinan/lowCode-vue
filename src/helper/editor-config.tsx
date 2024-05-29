import { JSX } from "vue/jsx-runtime";
import { ElButton } from "element-plus";
export interface RegisterConfigRecord {
  key: string;
  label: string;
  preview: (params?: any) => JSX.Element | string;
  render: (params?: any) => JSX.Element | string;
}

export interface ComponentMap {
  [key: string]: RegisterConfigRecord
}

export interface EditorConfig {
  componentList: RegisterConfigRecord[];
  componentMap: ComponentMap;
  register(configRecord: RegisterConfigRecord): void;
}

function createEditorConfig() {
  const componentList: RegisterConfigRecord[] = [];
  const componentMap: ComponentMap = {};

  return {
    componentList,
    componentMap,
    register: (configRecord: RegisterConfigRecord)=>{
      componentList.push(configRecord);
      componentMap[configRecord.key] = configRecord
    }
  }
}

const registerConfig = createEditorConfig();

registerConfig.register({
  key: "text",
  label: "文本",
  preview: () => "预览文本",
  render: () => "渲染文本"
});

registerConfig.register({
  key: "button",
  label: "按钮",
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染按钮</ElButton>
});

registerConfig.register({
  key: "input",
  label: "输入框",
  preview: () => <el-input>预览输入框</el-input>,
  render: () => <el-input>渲染输入框</el-input>
});

export default registerConfig;

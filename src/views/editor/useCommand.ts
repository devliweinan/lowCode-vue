import emitter from "@/helper/mitt";
import { EditorBlockVO, BlocksAttribute } from "@/views/editor/types";
import deepcopy from "deepcopy";
import { Ref, onUnmounted } from "vue";

interface ExecFun {
  (...arg: any[]): void
}

interface QueueRecord {
  redo: ExecFun; 
  revoke?: ExecFun
}

interface CommandRecord {
  name: string;
  keyboard?: string;
  pushQueue?: boolean;
  beforeData?: BlocksAttribute[];
  init?: (...arg: any[]) => ExecFun;
  execute: () => QueueRecord;
}

interface CommandsMap {
  [key: string]: ExecFun
}

interface CommandState {
  current: number;
  queue: QueueRecord[],
  commands: CommandsMap,
  commandArray: CommandRecord[],
  destroyArray: ExecFun[]

}

export default function useCommand(data: Ref<EditorBlockVO>) {
  const commandState: CommandState = {
    current: -1,  // 撤销和重做的索引值
    queue: [], // 队列，存放所有的操作命令
    commands: {}, // 命令和执行函数映射
    commandArray: [], // 存放所有的命令
    destroyArray: [] // 销毁函数集合（主要是取消发布订阅。init执行后可能会返回销毁函数）
  }

  // 注册命令的方法
  const registry = (command: CommandRecord) => {

    commandState.commandArray.push(command);
    // 命令和执行函数的映射
    commandState.commands[command.name] = () => {
      const { redo, revoke  } = command.execute();
      redo();
      if(!command.pushQueue) return;
      if(commandState.queue.length > 0) {
        commandState.queue = commandState.queue.slice(0, commandState.current + 1); // 防止放置组件的过程中有撤销操作
      }
      commandState.queue.push({redo, revoke});
      commandState.current = commandState.current + 1;
    }
  }

  // 注册我们需要的命令

  // 重做
  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo:() => {
          const itemQueue = commandState.queue[commandState.current + 1];
          if(itemQueue) {
            commandState.current++;
            console.log(commandState.current);
            itemQueue.redo && itemQueue.redo();
          }
        }
      }
    }
  })

  // 撤销
  registry({
    name: "revoke",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo:() => {
          if(commandState.current === -1) return;
          console.log(commandState.current,"======redocurrent=====")
          const itemQueue = commandState.queue[commandState.current];
          itemQueue.revoke && itemQueue.revoke();
          commandState.current--;
          
        }
      }
    }
  });
  // 组件拖入画布
  registry({
    name: "drag",
    pushQueue: true,
    init() { // 初始化执行的操作
      const start = () => {
        this.beforeData = deepcopy(data.value.blocks);
      };
      const end = () => {
        console.log("end")
        commandState.commands.drag();
      }
      emitter.on("dragStart", start);
      emitter.on("dragEnd", end);
      return () => {
        emitter.off("dragStart", start);
        emitter.off("dragEnd", end);
      }
    },
    execute() {
      const beforeData = this.beforeData as BlocksAttribute[];
      const afterData = deepcopy(data.value.blocks);
      return {
        redo() {
          console.log(afterData,"======afterData==redo====");
          data.value = {...data.value, blocks: afterData}
          console.log("======init=======================");
        },
        revoke() {
          data.value = {...data.value, blocks: beforeData}
        }
      }
    }
  });

 
  const keyboardEvent = () => { // 初始化事件
    const onKeyDown = (event: KeyboardEvent)=> {
      const keyCodes: { [key:number]: string } = { 90: "z",89: "y" };
      const { ctrlKey, keyCode } = event;
      let keyStringArr: string[] = [];
      if(ctrlKey) keyStringArr.push("ctrl");
      keyStringArr.push(keyCodes[keyCode]);
      const keyString = keyStringArr.join("+");
      commandState.commandArray.forEach(({keyboard, name}) => {
        if(!keyboard) return;
        if(keyboard === keyString) {
          commandState.commands[name]();
          event.preventDefault();
        }
      });
    }
    window.addEventListener("keydown",onKeyDown);
    return () => { // 销毁事件
      window.removeEventListener("keydown",onKeyDown);
    }
  };



  ;(() => {
    commandState.destroyArray.push(keyboardEvent())
    commandState.commandArray.forEach(command=>{
      command.init && commandState.destroyArray.push(command.init());
    })
  })()

  onUnmounted(() => {
    // 执行所有的销毁函数
    commandState.destroyArray.forEach(fun => fun && fun());
    commandState.destroyArray = [];
  });
  
  return commandState;
} 

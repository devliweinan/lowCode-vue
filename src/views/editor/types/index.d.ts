
export interface ContainerAttribute {
  width?: number;
  height?: number;
}

export interface BlocksAttribute extends ContainerAttribute {
  id: string;
  top: number;
  left: number;
  zIndex: number;
  alginCenter?: boolean;
  focus?: boolean;
  key: string;

}

export interface EditorBlockVO {
  container: ContainerAttribute,
  blocks: BlocksAttribute[]
}

export interface FocusData {
  focus: BlocksAttribute[];
  unfocus: BlocksAttribute[]
}

export interface OpreationButton {
  key: string;
  label: string;
  type: string;
  icon: string;
  handler: () => void;
}
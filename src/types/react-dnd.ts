export interface ItemType {
  id: string;
  index?: number;
  name: string;
  type: string;
  parentId: string | null;
  items?: ItemType[];
}

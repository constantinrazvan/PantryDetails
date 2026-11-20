import { ItemType } from './item-type';

export interface Item {
  id: number;
  type: ItemType;
  title: string;
  originalName: string | null;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
  updatedAt: string;

  username?: string;
  url?: string | null;

  body?: string;
  notes?: string | null;
}

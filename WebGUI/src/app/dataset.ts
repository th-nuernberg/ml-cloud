import { View } from './view';

export class Dataset {
  id: string;
  filename: string;
  headings: string[];
  data: any[];
  views: View[];
}
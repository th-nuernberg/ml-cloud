import { View } from './view';

export const VIEWS: View[] = [
  { 
    view_id: '1',
    view_name: 'optional_name', 
    dataset_id: '1',
    data_columns: ["alter" , "klasse"], 
    target_columns: ["note"],
    column_names: []
  },
  { 
    view_id: '2',
    view_name: 'View2',
    dataset_id: '21' ,
    data_columns: ["alter","klasse"], 
    target_columns: [], 
    column_names: [] 
  }
];



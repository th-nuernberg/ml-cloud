import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent }      from './dashboard/dashboard.component';
import { TrainingComponent }      from './training/training.component';
import { EvaluationComponent }      from './evaluation/evaluation.component';
import { DatasetsComponent }      from './datasets/datasets.component';
import { ModelsComponent }      from './models/models.component';
import { GetStartedComponent }      from './get-started/get-started.component';
import { AboutComponent }      from './about/about.component';
import { TrainingUploadComponent }      from './training-upload/training-upload.component';
import { TrainingLabelComponent }      from './training-label/training-label.component';
import { TrainingArchitectureComponent }      from './training-architecture/training-architecture.component';
import { TrainingConfigComponent }      from './training-config/training-config.component';
import { TrainingCheckComponent }      from './training-check/training-check.component';
import { EvaluationModelComponent }      from './evaluation-model/evaluation-model.component';
import { EvaluationDataComponent }      from './evaluation-data/evaluation-data.component';
import { EvaluationViewComponent }      from './evaluation-view/evaluation-view.component';
import { EvaluationCheckComponent }      from './evaluation-check/evaluation-check.component';
import { HomeComponent }      from './home/home.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'training', component: TrainingComponent },
  { path: 'evaluation', component: EvaluationComponent },
  { path: 'datasets', component: DatasetsComponent },
  { path: 'models', component: ModelsComponent },
  { path: 'get-started', component: GetStartedComponent },
  { path: 'about', component: AboutComponent },
  { path: 'training/upload', component: TrainingUploadComponent },
  { path: 'training/label', component: TrainingLabelComponent },
  { path: 'training/architecture', component: TrainingArchitectureComponent },
  { path: 'training/config', component: TrainingConfigComponent },
  { path: 'training/check', component: TrainingCheckComponent },
  { path: 'evaluation/model', component: EvaluationModelComponent },
  { path: 'evaluation/data', component: EvaluationDataComponent },
  { path: 'evaluation/view', component: EvaluationViewComponent },
  { path: 'evaluation/check', component: EvaluationCheckComponent },
  { path: 'home', component: HomeComponent },
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
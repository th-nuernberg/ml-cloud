import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ModelsComponent } from './models/models.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TrainingComponent } from './training/training.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { DatasetDetailComponent } from './dataset-detail/dataset-detail.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { JobSetsComponent } from './job-sets/job-sets.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { AboutComponent } from './about/about.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { Dashboard1Component } from './dashboard1/dashboard1.component';
import { HttpClientModule } from '@angular/common/http';
import { TrainingUploadComponent } from './training-upload/training-upload.component';
import { TrainingLabelComponent } from './training-label/training-label.component';
import { TrainingArchitectureComponent } from './training-architecture/training-architecture.component';
import { TrainingConfigComponent } from './training-config/training-config.component';
import { TrainingCheckComponent } from './training-check/training-check.component';
import { TimelineComponent } from './timeline/timeline.component';
import { ExperimentsComponent } from './experiments/experiments.component';
import { Timeline2Component } from './timeline2/timeline2.component';
import { EvaluationModelComponent } from './evaluation-model/evaluation-model.component';
import { EvaluationDataComponent } from './evaluation-data/evaluation-data.component';
import { EvaluationCheckComponent } from './evaluation-check/evaluation-check.component';
import { Timeline3Component } from './timeline3/timeline3.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { EvaluationViewComponent } from './evaluation-view/evaluation-view.component';
import { GlobalService } from './global.service';
import { ModalModule } from './modal';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ModelsComponent,
    NavbarComponent,
    TrainingComponent,
    EvaluationComponent,
    DatasetDetailComponent,
    FileUploadComponent,
    JobSetsComponent,
    DatasetsComponent,
    AboutComponent,
    GetStartedComponent,
    Dashboard1Component,
    TrainingUploadComponent,
    TrainingLabelComponent,
    TrainingArchitectureComponent,
    TrainingConfigComponent,
    TrainingCheckComponent,
    TimelineComponent,
    ExperimentsComponent,
    Timeline2Component,
    EvaluationModelComponent,
    EvaluationDataComponent,
    EvaluationCheckComponent,
    Timeline3Component,
    EvaluationViewComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    AngularFontAwesomeModule,
    ReactiveFormsModule,
    ModalModule
  ],
  providers: [GlobalService],
  bootstrap: [AppComponent]
})
export class AppModule { }

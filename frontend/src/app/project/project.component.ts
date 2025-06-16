import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { start } from 'repl';

@Component({
  selector: 'app-project',
  
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  standalone: true,
})
export class ProjectComponent implements OnInit {

  showAddProjectModal = false;
  isLoading = false;
  projectForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.projectForm = this.formBuilder.group({
      name: [''],
      description: [''],
      startDate: [''],
      endDate: [''],
      priority: ['Low'],
    });
  }
  
  addProject(projectName: string) {
    console.log(`Adding project: ${projectName}`);
  }
  
  listProjects() {
    console.log('Listing all projects');
  }
  
  openAddProjectModal() {
    this.showAddProjectModal = true;
    // log
    console.log('Opening add project modal');
  }

  closeAddProjectModal() {
    this.showAddProjectModal = false;
  }

  saveProject() {
    if (this.projectForm.valid) {
      const projectName = this.projectForm.value.projectName;
      const projectDescription = this.projectForm.value.projectDescription;
      this.addProject(projectName);
      this.closeAddProjectModal();
      // log
      console.log(`Project saved: ${projectName}, Description: ${projectDescription}`);
    } else {
      console.error('Project form is invalid');
    }
  }
} 

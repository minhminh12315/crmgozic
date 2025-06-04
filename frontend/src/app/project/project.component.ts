import { Component } from '@angular/core';

@Component({
  selector: 'app-project',
  imports: [],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent {
  // This component can be used to manage projects, tasks, and other related functionalities.
  // It can be expanded with additional methods and properties as needed.
  
  constructor() {
    // Initialization logic can go here
  }
  
  // Example method to add a new project
  addProject(projectName: string) {
    console.log(`Adding project: ${projectName}`);
    // Logic to add the project would go here
  }
  
  // Example method to list all projects
  listProjects() {
    console.log('Listing all projects');
    // Logic to list projects would go here
  }
} 

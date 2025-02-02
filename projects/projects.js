import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const numberOfProjects = projectsContainer.children.length;
let pageTitle = document.querySelector('.title');
pageTitle.textContent = `${numberOfProjects} ` + pageTitle.textContent;
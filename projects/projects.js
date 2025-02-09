import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const numberOfProjects = projectsContainer.children.length;
let pageTitle = document.querySelector('.title');
pageTitle.textContent = `${numberOfProjects} ` + pageTitle.textContent;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeAccent);

let searchFilteredProjects = projects;
let pieFilteredProjects = projects;
let filteredProjects = projects;
renderPieChart(projects);

// Search bar and filtering
let selectedIndex = -1;
let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
    // update query value
    query = event.target.value;
    // filter projects
    let searchFilteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    filteredProjects = projects.filter((project) => {
        return searchFilteredProjects.includes(project)
    });
    
    filteredProjects = projects.filter((project) => {
        return searchFilteredProjects.includes(project) && pieFilteredProjects.includes(project)
    });
    // render filtered projects
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});

function renderPieChart(filteredProjects) {
    // clear the existing pie chart
    d3.select('.legend').html('');
    let newSVG = d3.select('svg'); 
    newSVG.selectAll('path').remove();

    let rolledData = d3.rollups(
        filteredProjects,
        (v) => v.length,
        (d) => d.year,
    );
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    arcs.forEach((arc, idx) => {
        d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx));
    });
    let svg = d3.select('svg');
    svg.selectAll('path').remove();
    arcs.forEach((arc, i) => {
        svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;
            svg
            .selectAll('path')
            .attr('class', (_, idx) => (
                idx === selectedIndex ? 'selected' : ''
            ));
            legend
            .selectAll('li')
            .attr('class', (_, idx) => (
                idx === selectedIndex ? 'selected' : ''
            ));
            
            if (selectedIndex === -1) {
                renderProjects(searchFilteredProjects, projectsContainer, 'h2');
                pieFilteredProjects = projects;
              } else {
                pieFilteredProjects = projects.filter((project) => {
                    return project.year === data[selectedIndex].label;
                });
                filteredProjects = projects.filter((project) => {
                    return pieFilteredProjects.includes(project) && searchFilteredProjects.includes(project)
                });
                renderProjects(filteredProjects, projectsContainer, 'h2');
              }
        });
    });
    let legend = d3.select('.legend');
    data.forEach((d, idx) => {
        legend.append('li')
            .html(`<span class="swatch" style="background-color:${colors(idx)}"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    });
}
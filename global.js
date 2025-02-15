console.log('IT‘S ALIVE!');

// Create the nav bar

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}


let pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contacts' },
    { url: 'resume/index.html', title: 'Resume' },
    { url: 'meta/index.html', title: 'Meta' },
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);
const ARE_WE_HOME = document.documentElement.classList.contains('home');
for(let p of pages){
    let url = p.url;
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
      }
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
      }
    if (a.host !== location.host) {
        a.target = '_blank';
      }
    nav.append(a);
}

// Adding the theme selecting menu
let themeLabel = document.createElement('label');
themeLabel.htmlFor = 'theme-select';
themeLabel.textContent = 'Theme:';

let themeSelect = document.createElement('select');
themeSelect.id = 'theme-select';
let themes = ['light', 'dark', 'automatic'];
for (let theme of themes) {
    let option = document.createElement('option');
    option.value = theme;
    option.textContent = theme;
    themeSelect.append(option);
}
themeSelect.value = 'light';
document.documentElement.style.setProperty('color-scheme', 'light');

let themeContainer = document.createElement('div');
themeLabel.classList.add('theme-select-label');
themeSelect.classList.add('theme-select-select');
themeContainer.append(themeLabel, themeSelect);
themeContainer.classList.add('theme-select');
document.body.prepend(themeContainer);

themeSelect.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    if (event.target.value === 'automatic') {
        console.log('color scheme automatic');
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (darkModeMediaQuery.matches) {
            document.documentElement.style.setProperty('color-scheme', 'dark');
        } else {
            document.documentElement.style.setProperty('color-scheme', 'light');
        }
        darkModeMediaQuery.addEventListener('change', (e) => {
            document.documentElement.style.setProperty('color-scheme', e.matches ? 'dark' : 'light');
        });
    }
  });

// Fixing the email sending
let form = document.querySelector('form');
if (form) {
    console.log('Form found');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        let data = new FormData(form);
        let url = form.action + '?';
        let params = [];
        for (let [name, value] of data) {
            // TODO build URL parameters here
            params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
            url += params.join('&');
            console.log(name, value);
          }
        window.location.href = url;
        console.log('Form submitted');
    });
}

// Importing projects data
export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const data = await response.json();
        return data; 

    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(projects, containerElement, headingLevel) {
    containerElement.innerHTML = '';
    const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!validHeadingLevels.includes(headingLevel)) {
        throw new Error('Invalid heading level. Please use "h1" to "h6".');
    }
    for (const project of projects) {
        const article = document.createElement('article');
        const title = document.createElement(headingLevel);
        const description_block = document.createElement('div');
        const description = document.createElement('p');
        const year = document.createElement('span');
        year.classList.add('year');
        const image = document.createElement('img');

        image.src = project.image;
        image.alt = project.title;
        title.textContent = project.title;
        year.textContent = `${project.year}`;
        description.textContent = project.description;
        
        description_block.append(description);
        description_block.append(year);
        article.append(title);
        article.append(description_block);
    
        containerElement.appendChild(article);
    }
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
  }
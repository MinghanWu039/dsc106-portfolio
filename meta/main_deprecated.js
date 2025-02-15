let data = [];
let commits = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  commits = d3.groups(data, (d) => d.commit);
});

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    if (Object.keys(commit).length === 0) {
        link.href = '';
        link.textContent = '';
        date.textContent = '';
        return;
    }
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
  }

function createScatterplot() {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  const dots = svg.append("g").attr("class", "dots");

  dots
    .selectAll("circle")
    .data(commits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", 5)
    .attr("fill", "steelblue");

  dots.data(commits);
  dots
    .on('mouseenter', (event, commit) => {
      updateTooltipContent(commit);
    })
    .on('mouseleave', () => {
      updateTooltipContent({}); // Clear tooltip content
    });

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

  // Add X axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append("g")
    .attr("transform", `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append("g")
    .attr("class", "gridlines")
    .attr("transform", `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(
    d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
  );
}

async function loadData() {
  data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));
  displayStats();
  createScatterplot();
}

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: "https://github.com/vis-society/lab-7/commit/" + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, "lines", {
        value: lines,
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
        configurable: false,
        writable: false,
        enumerable: false,
      });

      return ret;
    });
}

function displayStats() {
  // Process commits first
  processCommits();

  // Create the dl element
  const dl = d3.select("#stats").append("dl").attr("class", "stats");

  // Add total LOC
  dl.append("dt").html('TOTAL <abbr title="LINES OF CODE">LOC</abbr>');
  dl.append("dd").text(data.length);

  // Add Total Commits
  dl.append("dt").text("TOTAL COMMITS");
  dl.append("dd").text(commits.length);

  // Add Number Of Files In The Codebase
  dl.append("dt").text("NUMBER OF FILES");
  dl.append("dd").text(
    d3.rollups(
      data,
      (v) => v.length,
      (d) => d.file
    ).length
  );

  // Add Average File Length (In Lines)
  dl.append("dt").text("AVERAGE FILE LENGTH (IN LINES)");
  dl.append("dd").text(
    d3.mean(
      d3.rollups(
        data,
        (v) => v.length,
        (d) => d.file
      ),
      (d) => d[1]
    )
  );

  // Add Longest Line Length
  dl.append("dt").text("LONGEST LINE LENGTH");
  dl.append("dd").text(d3.max(data, (d) => d.length));

  // Add Number of days worked on site
  dl.append("dt").text("NUMBER OF DAYS WORKED ON SITE");
  dl.append("dd").text(
    d3.rollups(
      data,
      (v) => v.length,
      (d) => d.date
    ).length
  );

  // Add number of authors
  dl.append("dt").text("NUMBER OF AUTHORS");
  dl.append("dd").text(
    d3.rollups(
      data,
      (v) => v.length,
      (d) => d.author
    ).length
  );

  const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString("en", { dayPeriod: "short" })
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  dl.append("dt").text("MOST ACTIVE PERIOD");
  dl.append("dd").text(maxPeriod);
}

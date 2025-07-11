const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec';

const queryInput = document.getElementById('query');
const columnSelect = document.getElementById('column');
const sheetSelect = document.getElementById('sheet');
const searchBtn = document.getElementById('searchBtn');
const loader = document.getElementById('loader');
const statusDiv = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const resultsContainer = document.getElementById('results-container');
const downloadSection = document.getElementById('download-section');

document.getElementById('downloadCSV').addEventListener('click', () => download('csv'));
document.getElementById('downloadJSON').addEventListener('click', () => download('json'));

async function populateSheets() {
  const res = await fetch(WEB_APP_URL + '?mode=sheets');
  const sheets = await res.json();
  sheets.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    sheetSelect.appendChild(option);
  });
}

async function search() {
  const query = queryInput.value.trim();
  const column = columnSelect.value;
  const sheet = sheetSelect.value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (!query) {
    statusDiv.textContent = 'Please enter a search term.';
    return;
  }

  loader.style.display = 'block';
  statusDiv.textContent = '';
  resultsDiv.innerHTML = '';
  resultsContainer.style.display = 'none';
  downloadSection.style.display = 'none';

  const response = await fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify({ query, column, sheet, startDate, endDate }),
    headers: { 'Content-Type': 'application/json' }
  });

  const results = await response.json();
  loader.style.display = 'none';

  if (!results.length) {
    statusDiv.textContent = 'No results found.';
    return;
  }

  displayResults(results);
}

function displayResults(rows) {
  const table = document.createElement('table');
  const headers = ['Box Location', 'Item Name', 'UPC', 'Quantity', 'Received Date'];
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  resultsDiv.innerHTML = '';
  resultsDiv.appendChild(table);
  resultsContainer.style.display = 'block';
  downloadSection.style.display = 'block';
}

function download(type) {
  const table = document.querySelector('table');
  if (!table) return;

  let content = '';
  const rows = Array.from(table.querySelectorAll('tr')).map(row =>
    Array.from(row.querySelectorAll('th,td')).map(cell => cell.textContent)
  );

  if (type === 'csv') {
    content = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    downloadFile('results.csv', content);
  } else {
    const [header, ...data] = rows;
    const json = data.map(row => Object.fromEntries(row.map((v, i) => [header[i], v])));
    downloadFile('results.json', JSON.stringify(json, null, 2));
  }
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

searchBtn.addEventListener('click', search);
queryInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') search();
});

populateSheets();

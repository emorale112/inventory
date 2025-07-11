
const sheetSelect = document.getElementById('sheet');
const queryInput = document.getElementById('query');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const resultsContainer = document.getElementById('results-container');
const statusDiv = document.getElementById('status');
const loader = document.getElementById('loader');
const downloadSection = document.getElementById('download-section');
const downloadCSVBtn = document.getElementById('downloadCSV');
const downloadJSONBtn = document.getElementById('downloadJSON');

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec';

async function populateSheetNames() {
  try {
    const res = await fetch(WEB_APP_URL + '?mode=sheets');
    const sheets = await res.json();
    sheets.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      sheetSelect.appendChild(option);
    });
  } catch (err) {
    statusDiv.textContent = 'Error loading sheets.';
  }
}

function formatDate(d) {
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString();
}

async function search() {
  const query = queryInput.value.trim();
  const column = document.getElementById('column').value;
  const sheet = sheetSelect.value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (!query) {
    statusDiv.textContent = 'Please enter a search term.';
    return;
  }
  statusDiv.textContent = 'Searching...';
  loader.style.display = 'block';
  resultsContainer.style.display = 'none';
  downloadSection.style.display = 'none';
  searchBtn.disabled = true;

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, column, sheet, startDate, endDate })
    });
    const results = await response.json();
    loader.style.display = 'none';
    searchBtn.disabled = false;

    if (!results.length) {
      statusDiv.textContent = 'No matching rows found.';
      return;
    }
    statusDiv.textContent = `Found ${results.length} matching rows.`;
    displayResults(results);
  } catch (err) {
    loader.style.display = 'none';
    searchBtn.disabled = false;
    statusDiv.textContent = 'Error: ' + err.message;
  }
}

function displayResults(results) {
  const headers = ['Box Location', 'Item Name', 'UPC', 'Quantity', 'Received Date'];
  const table = document.createElement('table');
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
  results.forEach(row => {
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

queryInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchBtn.click();
});
searchBtn.addEventListener('click', search);

populateSheetNames();

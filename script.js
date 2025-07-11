const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec';

// Show status message
function setStatus(message) {
  const status = document.getElementById('status');
  if (status) status.textContent = message;
}

// Load sheet names
async function loadSheets() {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getSheetNames' })
    });
    const data = await res.json();
    const sheetSelect = document.getElementById('sheet');
    if (!data.sheets || !Array.isArray(data.sheets)) throw new Error('No sheets found');
    data.sheets.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sheetSelect.appendChild(opt);
    });
    setStatus('Ready');
  } catch (err) {
    setStatus('Error loading sheets: ' + err.message);
  }
}

// Display search results in a table
function displayResults(results) {
  const container = document.getElementById('results');
  container.innerHTML = '';

  if (!results || !results.length) {
    container.textContent = 'No matching rows found.';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Box Location', 'Item Name', 'UPC', 'Quantity', 'Received Date'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
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
  container.appendChild(table);
}

// Search button handler
async function runSearch() {
  const query = document.getElementById('query').value.trim();
  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;

  if (!query) return setStatus('Please enter a search term.');

  setStatus('Searching...');
  document.getElementById('results').innerHTML = '';

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'searchSheets',
        query,
        column,
        sheet
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    displayResults(data.results);
    setStatus(`Found ${data.results.length} matching row(s).`);
  } catch (err) {
    setStatus('Search error: ' + err.message);
  }
}

// Add event listeners
document.getElementById('searchBtn').addEventListener('click', runSearch);
document.getElementById('query').addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});

// Initialize on page load
loadSheets();

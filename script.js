const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec';

// Set status text
function setStatus(text) {
  const status = document.getElementById('status');
  status.textContent = text;
}

// Load sheet names
async function loadSheets() {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'getSheetNames' }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    const select = document.getElementById('sheet');
    data.sheets.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
    setStatus('Ready');
  } catch (err) {
    setStatus('Error loading sheets: ' + err.message);
  }
}

// Display results in table
function displayResults(results) {
  const container = document.getElementById('results');
  container.innerHTML = '';

  if (!results.length) {
    container.textContent = 'No matching rows found.';
    return;
  }

  const table = document.createElement('table');
  table.style.width = '100%';

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

// Run search
async function runSearch() {
  const query = document.getElementById('query').value.trim();
  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;

  if (!query) return setStatus('Please enter a search term.');
  setStatus('Searching...');

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'searchSheets',
        query,
        column,
        sheet
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.error) {
      setStatus('Error: ' + data.error);
      return;
    }
    displayResults(data.results);
    setStatus(`Found ${data.results.length} row(s).`);
  } catch (err) {
    setStatus('Search error: ' + err.message);
  }
}

// Event Listeners
document.getElementById('searchBtn').addEventListener('click', runSearch);
document.getElementById('query').addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});

// Init
loadSheets();

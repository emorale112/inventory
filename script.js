const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec';

// Helper to update the status area
function setStatus(message) {
  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.textContent = message;
}

// Load sheet names into the dropdown
function loadSheets() {
  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getSheetNames' })
  })
    .then(res => res.json())
    .then(data => {
      const sheetSelect = document.getElementById('sheet');
      if (!sheetSelect || !data.sheets) throw new Error("Missing dropdown or data");

      data.sheets.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        sheetSelect.appendChild(opt);
      });

      setStatus('Ready');
    })
    .catch(err => setStatus('Error loading sheets: ' + err.message));
}

// Display search results in a table
function displayResults(results) {
  const container = document.getElementById('results');
  container.innerHTML = '';

  if (!results.length) {
    container.textContent = 'No matching rows found.';
    return;
  }

  const table = document.createElement('table');
  table.classList.add('results-table');

  const headers = ['Box Location', 'Item Name', 'UPC', 'Quantity', 'Received Date'];
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  results.forEach((row, i) => {
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

// Handle the search
function runSearch() {
  const query = document.getElementById('query').value.trim();
  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;

  if (!query) {
    setStatus('Please enter a search term.');
    return;
  }

  setStatus('Searching...');
  document.getElementById('results').innerHTML = '';

  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'searchSheets',
      query,
      column,
      sheet
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setStatus('Search error: ' + data.error);
      } else {
        displayResults(data.results);
        setStatus(`Found ${data.results.length} result(s).`);
      }
    })
    .catch(err => setStatus('Search error: ' + err.message));
}

// Attach listeners
document.getElementById('searchBtn')?.addEventListener('click', runSearch);
document.getElementById('query')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});

// Initialize on load
loadSheets();

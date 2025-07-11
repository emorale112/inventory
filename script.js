const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec';

function setStatus(text) {
  document.getElementById('status').textContent = text;
}

function clearResults() {
  document.getElementById('results').innerHTML = '';
  document.getElementById('downloadButtons').style.display = 'none';
  setStatus('Results cleared.');
}

function displayResults(data) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  if (!data.length) {
    container.textContent = 'No matching rows found.';
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Box Location</th>
        <th>Item Name</th>
        <th>UPC</th>
        <th>Quantity</th>
        <th>Received Date</th>
      </tr>
    </thead>
    <tbody>
      ${data.map((row, i) => `
        <tr style="background:${i % 2 === 0 ? '#f9f9ff' : '#ffffff'}">
          ${row.map(cell => `<td>${cell}</td>`).join('')}
        </tr>`).join('')}
    </tbody>`;
  container.appendChild(table);
  document.getElementById('downloadButtons').style.display = 'block';
}

function downloadCSV() {
  const table = document.querySelector('#results table');
  if (!table) return;
  let csv = [];
  table.querySelectorAll('tr').forEach(row => {
    const cells = Array.from(row.querySelectorAll('th,td')).map(td => `"${td.textContent}"`);
    csv.push(cells.join(','));
  });
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'search_results.csv';
  a.click();
}

function downloadJSON() {
  const table = document.querySelector('#results table');
  if (!table) return;
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
  const data = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
    const row = Array.from(tr.querySelectorAll('td')).map(td => td.textContent);
    return Object.fromEntries(headers.map((key, i) => [key, row[i]]));
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'search_results.json';
  a.click();
}

async function runSearch() {
  const query = document.getElementById('query').value.trim();
  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;
  const email = document.getElementById('email').value.trim();
  const spinner = document.getElementById('spinner');
  const searchContainer = document.getElementById('searchContainer');

  if (!query) return setStatus('Please enter a search term.');
  setStatus('Searching...');
  spinner.style.display = 'block';

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'search', query, column, sheet, email }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    displayResults(data.results);
    setStatus(`Found ${data.results.length} matching row(s).`);
    searchContainer.style.maxHeight = '0';
    searchContainer.style.overflow = 'hidden';
  } catch (err) {
    setStatus('Search error: ' + err.message);
  } finally {
    spinner.style.display = 'none';
  }
}

// Load sheet names
async function loadSheets() {
  try {
    const res = await fetch(SCRIPT_URL + '?action=getSheetNames');
    const data = await res.json();
    const sheetSelect = document.getElementById('sheet');
    data.sheets.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sheetSelect.appendChild(opt);
    });
  } catch (err) {
    setStatus('Error loading sheets: ' + err.message);
  }
}

document.getElementById('searchBtn').addEventListener('click', runSearch);
document.getElementById('clearBtn').addEventListener('click', clearResults);
document.getElementById('query').addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});

loadSheets();

window.onload = () => {
  document.getElementById('query').focus();
};


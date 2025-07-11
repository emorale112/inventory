const backendUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // replace YOUR_SCRIPT_ID

// Populate sheets dropdown on load
window.addEventListener('DOMContentLoaded', () => {
  fetch(`${backendUrl}?action=getSheetNames`)
    .then(res => res.json())
    .then(data => {
      // Defensive: check if data.sheets is array
      const sheetNames = Array.isArray(data.sheets) ? data.sheets : [];
      const sheetSelect = document.getElementById('sheet');
      sheetNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        sheetSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error('Error loading sheets:', err);
      const status = document.getElementById('status');
      if (status) status.textContent = 'Failed to load sheets.';
    });
});

// Search button click handler
document.getElementById('searchBtn').addEventListener('click', () => {
  const query = document.getElementById('query').value.trim();
  if (!query) {
    setStatus('Please enter a search term.');
    return;
  }

  setStatus('');
  toggleSpinner(true);

  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;

  const url = new URL(backendUrl);
  url.searchParams.append('action', 'searchSheets');
  url.searchParams.append('query', query);
  url.searchParams.append('column', column);
  url.searchParams.append('sheet', sheet);

  fetch(url.toString())
    .then(res => res.json())
    .then(data => {
      toggleSpinner(false);
      if (data.error) {
        setStatus('Error: ' + data.error);
        clearResults();
        return;
      }
      setStatus(`Found ${data.results.length} matching row(s).`);
      displayResults(data.results);
    })
    .catch(err => {
      toggleSpinner(false);
      setStatus('Search failed.');
      console.error(err);
    });
});

function toggleSpinner(show) {
  const spinner = document.getElementById('spinner');
  if (!spinner) return;
  spinner.style.display = show ? 'block' : 'none';
}

function setStatus(msg) {
  const status = document.getElementById('status');
  if (!status) return;
  status.textContent = msg;
}

function clearResults() {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;
  resultsDiv.innerHTML = '';
}

function displayResults(results) {
  clearResults();
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;

  if (!results.length) {
    resultsDiv.textContent = 'No matching rows found.';
    return;
  }

  const table = document.createElement('table');
  table.border = '1';
  const headerRow = document.createElement('tr');
  ['Box Location', 'Item Name', 'UPC', 'Quantity', 'Received Date'].forEach(hdr => {
    const th = document.createElement('th');
    th.textContent = hdr;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  results.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  resultsDiv.appendChild(table);
}

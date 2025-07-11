const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec'; 
// Replace YOUR_SCRIPT_ID with your actual Google Apps Script deployment ID

// Load sheet names on page load
window.addEventListener('DOMContentLoaded', () => {
  fetch(`${SCRIPT_URL}?mode=sheets`)
    .then(r => r.json())
    .then(sheetNames => {
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
      showStatus('Failed to load sheet names.');
    });
});

document.getElementById('searchBtn').addEventListener('click', runSearch);

document.getElementById('query').addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});

function showStatus(msg) {
  const status = document.getElementById('status');
  status.textContent = msg;
}

function showSpinner(show) {
  document.getElementById('spinner').style.display = show ? 'block' : 'none';
}

function runSearch() {
  const query = document.getElementById('query').value.trim();
  if (!query) {
    showStatus('Please enter a search term.');
    return;
  }

  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  showStatus('Searching...');
  showSpinner(true);
  document.getElementById('searchBtn').disabled = true;

  const params = new URLSearchParams({
    mode: 'search',
    query,
    column,
    sheet,
    startDate,
    endDate
  });

  fetch(`${SCRIPT_URL}?${params.toString()}`)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(results => {
      showSpinner(false);
      document.getElementById('searchBtn').disabled = false;

      if (results.error) {
        showStatus(`Error: ${results.error}`);
        clearResults();
        return;
      }

      if (!results.length) {
        showStatus('No matching rows found.');
        clearResults();
        return;
      }

      showStatus(`Found ${results.length} matching row(s).`);

      displayResults(results);
    })
    .catch(error => {
      showSpinner(false);
      document.getElementById('searchBtn').disabled = false;
      showStatus('Search failed: ' + error.message);
      clearResults();
    });
}

function clearResults() {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';
  document.getElementById('resultsTable').style.display = 'none';
}

function displayResults(results) {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';

  results.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  document.getElementById('resultsTable').style.display = 'table';
}

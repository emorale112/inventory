const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec';

function setStatus(text) {
  document.getElementById('status').textContent = text;
}

function displayResults(rows) {
  const container = document.getElementById('results');
  if (!rows.length) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }
  let html = '<table><thead><tr><th>Box Location</th><th>Item Name</th><th>UPC</th><th>Quantity</th><th>Received Date</th></tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function loadSheets() {
  fetch(`${SCRIPT_URL}?action=getSheetNames`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('sheet');
      data.sheets.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
      });
      setStatus('Ready');
    })
    .catch(() => setStatus('Failed to load sheets'));
}

function runSearch() {
  const query = document.getElementById('query').value.trim();
  if (!query) {
    setStatus('Enter a search term');
    return;
  }
  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;
  setStatus('Searching...');
  displayResults([]);

  fetch(`${SCRIPT_URL}?action=searchSheets&query=${encodeURIComponent(query)}&column=${encodeURIComponent(column)}&sheet=${encodeURIComponent(sheet)}`)
    .then(res => res.json())
    .then(data => {
      if (data.results) {
        setStatus(`Found ${data.results.length} rows`);
        displayResults(data.results);
      } else {
        setStatus('No results');
      }
    })
    .catch(() => setStatus('Search failed'));
}

document.getElementById('searchBtn').addEventListener('click', runSearch);
window.onload = loadSheets;

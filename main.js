// Replace with your deployed Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxCgx7BuJ4v6fqOoCPVbWglLZ5e0eF6shzPJNRqvMHzQ9znYvK5QKsyjNGWi0Zp0IIsw/exec';

function searchSheets() {
  const query = document.getElementById('searchInput').value.trim();
  const statusDiv = document.getElementById('status');
  const resultsDiv = document.getElementById('results');
  statusDiv.textContent = '';
  resultsDiv.textContent = '';

  if (!query) {
    statusDiv.textContent = 'Please enter a search term.';
    statusDiv.className = 'error';
    return;
  }

  statusDiv.textContent = 'Searching...';
  statusDiv.className = '';

  fetch(`${APPS_SCRIPT_URL}?action=search&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusDiv.textContent = `Found ${data.results.length} matching row(s).`;
        statusDiv.className = 'success';
        if (data.results.length === 0) {
          resultsDiv.textContent = 'No results found.';
        } else {
          // Display as a table
          let html = '<table border="1" cellpadding="4" style="border-collapse:collapse;"><tr>';
          html += ['Sheet', 'Item Name', 'UPC', 'Quantity', 'Received Date'].map(h => `<th>${h}</th>`).join('');
          html += '</tr>';
          data.results.forEach(row => {
            html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
          });
          html += '</table>';
          resultsDiv.innerHTML = html;
        }
      } else {
        statusDiv.textContent = 'Error: ' + data.error;
        statusDiv.className = 'error';
      }
    })
    .catch(err => {
      statusDiv.textContent = 'Error: ' + err;
      statusDiv.className = 'error';
    });
}

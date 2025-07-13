// Replace with your deployed Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxCgx7BuJ4v6fqOoCPVbWglLZ5e0eF6shzPJNRqvMHzQ9znYvK5QKsyjNGWi0Zp0IIsw/exec';

function runSearch() {
  const query = document.getElementById('query').value.trim();
  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const status = document.getElementById('status');
  const spinner = document.getElementById('spinner');
  const button = document.getElementById('searchBtn');
  const resultsSection = document.getElementById('resultsSection');
  const resultsDiv = document.getElementById('results');

  if (!query) {
    status.textContent = 'Please enter a search term.';
    return;
  }

  status.textContent = 'Searching...';
  spinner.style.display = 'block';
  button.disabled = true;
  resultsSection.style.display = 'none';

  // Build query parameters
  const params = new URLSearchParams({
    action: 'search',
    query: query,
    column: column,
    sheet: sheet,
    startDate: startDate,
    endDate: endDate
  });

  fetch(`${APPS_SCRIPT_URL}?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = 'none';
      button.disabled = false;
      
      if (data.success) {
        status.textContent = `Found ${data.results.length} matching row(s).`;
        displayResults(data.results);
        const downloadButtons = document.getElementById('downloadButtons');
        downloadButtons.style.display = data.results.length > 0 ? 'flex' : 'none';
      } else {
        status.textContent = 'Error: ' + data.error;
      }
    })
    .catch(err => {
      spinner.style.display = 'none';
      button.disabled = false;
      status.textContent = 'Error: ' + err.message;
    });
}

function displayResults(results) {
  const resultsSection = document.getElementById('resultsSection');
  const resultsDiv = document.getElementById('results');
  
  if (results.length === 0) {
    resultsDiv.innerHTML = '<div class="no-results">No results found.</div>';
  } else {
    let html = '<table class="results-table"><thead><tr>';
    html += ['Sheet', 'Item Name', 'UPC', 'Quantity', 'Received Date'].map(h => `<th>${h}</th>`).join('');
    html += '</tr></thead><tbody>';
    
    results.forEach(row => {
      html += '<tr>' + row.map(cell => `<td>${cell || ''}</td>`).join('') + '</tr>';
    });
    
    html += '</tbody></table>';
    resultsDiv.innerHTML = html;
  }
  
  resultsSection.style.display = 'block';
}

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark');
  const toggle = document.getElementById('darkToggle');
  toggle.setAttribute('aria-checked', body.classList.contains('dark'));
}

function downloadResults(type) {
  // This would need to be implemented in your Apps Script backend
  // For now, we'll just show a message
  alert(`Download ${type.toUpperCase()} functionality needs to be implemented in the Apps Script backend.`);
}

// Event listeners
document.getElementById('query').addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});

window.onload = () => {
  document.getElementById('query').focus();
};

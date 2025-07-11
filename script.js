// Run after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load sheet names into dropdown
  fetchSheetNames();

  // Attach Enter key listener for search input
  const queryInput = document.getElementById('query');
  queryInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') search();
  });
});

function fetchSheetNames() {
  // Replace this with your backend fetch call to get sheet names
  fetch('https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec?action=getSheetNames')
    .then(res => res.json())
    .then(data => {
      const sheetSelect = document.getElementById('sheet');
      data.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        sheetSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error('Failed to fetch sheets:', err);
    });
}

async function search() {
  const query = document.getElementById('query').value.trim();
  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  const status = document.getElementById('status');
  const spinner = document.getElementById('spinner');
  const downloadButtons = document.getElementById('downloadButtons');
  const searchBtn = document.getElementById('searchBtn');

  if (!query) {
    status.textContent = 'Please enter a search term.';
    return;
  }

  status.textContent = 'Searching...';
  spinner.style.display = 'inline-block';
  searchBtn.disabled = true;
  downloadButtons.style.display = 'none';

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'searchSheets', 
        query, 
        column, 
        sheet, 
        startDate, 
        endDate 
      })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    spinner.style.display = 'none';
    searchBtn.disabled = false;

    if (data.results && data.results.length) {
      status.textContent = `Found ${data.results.length} matching rows.`;
      downloadButtons.style.display = 'block';

      // Optionally display results here or in sheet (depends on your app design)
      // You could add a function to render results on the page if you want
    } else {
      status.textContent = 'No matching rows found.';
      downloadButtons.style.display = 'none';
    }
  } catch (error) {
    spinner.style.display = 'none';
    searchBtn.disabled = false;
    status.textContent = 'Error: ' + error.message;
  }
}

function downloadResults(type) {
  // Replace with actual backend call or generate CSV/JSON from results cached in your app
  alert(`Download ${type.toUpperCase()} functionality not implemented yet.`);
}

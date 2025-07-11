const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxplszX0XuAQKRsutvmzcmU5ACI3nVaE6cwQamXxvZc2d14Ug2uHM3PmrkrJNJBdVj1Bw/exec';

// Utility to dynamically load JSONP script
function jsonp(url, callbackName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const cbName = callbackName || ('cb_' + Date.now());

    window[cbName] = (data) => {
      resolve(data);
      delete window[cbName];
      script.remove();
    };

    script.onerror = () => {
      reject(new Error('JSONP request failed'));
      delete window[cbName];
      script.remove();
    };

    script.src = `${url}&callback=${cbName}`;
    document.body.appendChild(script);
  });
}

// Populate sheets dropdown
function loadSheets() {
  jsonp(`${SCRIPT_URL}?action=getSheetNames`)
    .then(data => {
      if (data.error) throw new Error(data.error);
      const select = document.getElementById('sheet');
      data.sheets.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      });
      setStatus('Ready');
    })
    .catch(err => setStatus('Error loading sheets: ' + err.message));
}

// Display status text
function setStatus(text) {
  const status = document.getElementById('status');
  status.textContent = text;
}

// Render results in a table
function displayResults(results) {
  const container = document.getElementById('results');
  container.innerHTML = '';

  if (!results.length) {
    container.textContent = 'No matching rows found.';
    return;
  }

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  const headers = ['Box Location', 'Item Name', 'UPC', 'Quantity', 'Received Date'];
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    th.style.borderBottom = '2px solid #6a5acd';
    th.style.padding = '6px';
    th.style.backgroundColor = '#e4e0ff';
    th.style.color = '#3b2e8a';
    th.style.textAlign = 'left';
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  results.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.style.backgroundColor = i % 2 === 0 ? '#f8f7ff' : '#ffffff';
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      td.style.padding = '6px';
      td.style.borderBottom = '1px solid #ddd';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);
}

// Run search query
function runSearch() {
  const query = document.getElementById('query').value.trim();
  if (!query) {
    setStatus('Please enter a search term.');
    return;
  }

  const column = document.getElementById('column').value;
  const sheet = document.getElementById('sheet').value;

  setStatus('Searching...');
  displayResults([]);

  const url = `${SCRIPT_URL}?action=searchSheets&query=${encodeURIComponent(query)}&column=${encodeURIComponent(column)}&sheet=${encodeURIComponent(sheet)}`;
  jsonp(url)
    .then(data => {
      if (data.error) {
        setStatus('Error: ' + data.error);
        return;
      }
      setStatus(`Found ${data.results.length} matching row(s).`);
      displayResults(data.results);
    })
    .catch(err => {
      setStatus('Search error: ' + err.message);
    });
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', runSearch);
document.getElementById('query').addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});

// Initialize
loadSheets();

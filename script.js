body {
  font-family: 'Nunito', sans-serif;
  background-color: #f3f1ff;
  color: #3b2e8a;
  margin: 20px;
  padding: 0;
}

#search-area input,
#search-area select {
  margin-right: 8px;
  padding: 6px 8px;
  font-size: 16px;
  border: 1px solid #a9a2ff;
  border-radius: 4px;
}

button {
  background-color: #6a5acd;
  border: none;
  color: white;
  font-weight: 600;
  padding: 8px 14px;
  margin-right: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #5143a6;
}

.spinner {
  font-size: 30px;
  animation: pulse 1.5s infinite;
  display: inline-block;
  user-select: none;
  margin-left: 10px;
  vertical-align: middle;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

#status {
  margin-top: 12px;
  font-weight: 600;
}

#results table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

#results th,
#results td {
  border: 1px solid #ddd;
  padding: 8px;
}

#results th {
  background-color: #e4e0ff;
  color: #3b2e8a;
  text-align: left;
  font-weight: 700;
}

#results tr:nth-child(even) {
  background-color: #f9f9ff;
}

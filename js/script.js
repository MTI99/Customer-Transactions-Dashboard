document.addEventListener('DOMContentLoaded', function() {
    const customerTableBody = document.getElementById('customerTable').getElementsByTagName('tbody')[0];
    const customerFilter = document.getElementById('customerFilter');
    const amountFilter = document.getElementById('amountFilter');
    const ctx = document.getElementById('transactionChart').getContext('2d');
    let customers = [];
    let transactions = [];
    let chart;
  
    function fetchData() {
      fetch('http://localhost:3000/api/data')
        .then(response => response.json())
        .then(data => {
          customers = data.customers;
          transactions = data.transactions;
          displayData();
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  
    function displayData() {
      customerTableBody.innerHTML = '';
      transactions.forEach(transaction => {
        const customer = customers.find(c => c.id === transaction.customer_id);
        const row = customerTableBody.insertRow();
        row.insertCell(0).textContent = customer.name;
        row.insertCell(1).textContent = transaction.date;
        row.insertCell(2).textContent = transaction.amount;
      });
    }
  
    function filterData() {
      const customerName = customerFilter.value.toLowerCase();
      const amount = parseFloat(amountFilter.value) || 0;
      customerTableBody.innerHTML = '';
  
      transactions
        .filter(transaction => {
          const customer = customers.find(c => c.id === transaction.customer_id);
          return customer.name.toLowerCase().includes(customerName) && transaction.amount >= amount;
        })
        .forEach(transaction => {
          const customer = customers.find(c => c.id === transaction.customer_id);
          const row = customerTableBody.insertRow();
          row.insertCell(0).textContent = customer.name;
          row.insertCell(1).textContent = transaction.date;
          row.insertCell(2).textContent = transaction.amount;
        });
    }
  
    function drawChart(customerId) {
      const customerTransactions = transactions.filter(t => t.customer_id === customerId);
      const transactionDates = [...new Set(customerTransactions.map(t => t.date))];
      const transactionAmounts = transactionDates.map(date => {
        return customerTransactions.filter(t => t.date === date).reduce((sum, t) => sum + t.amount, 0);
      });
  
      if (chart) {
        chart.destroy();
      }
  
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: transactionDates,
          datasets: [{
            label: 'قيمة المعاملة',
            data: transactionAmounts,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  
    customerFilter.addEventListener('input', filterData);
    amountFilter.addEventListener('input', filterData);
    customerTableBody.addEventListener('click', function(event) {
      const row = event.target.closest('tr');
      if (row) {
        const customerName = row.cells[0].textContent;
        const customer = customers.find(c => c.name === customerName);
        drawChart(customer.id);
      }
    });
  
    fetchData();
  });
  
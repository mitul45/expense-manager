(function() {
  const utils = window.expenseManager.utils;
  const incomeColor = '#2ecc71';
  const expenseColor = '#ec644b';
  const chartJSDatasetTemplate = {
    borderWidth: 0.5,
    borderColor: '#333',
  };

  const expenseBarTemplate = {
    label: 'Expense',
    backgroundColor: expenseColor,
    ...chartJSDatasetTemplate,
  };
  const incomeBarTemplate = {
    label: 'Income',
    backgroundColor: incomeColor,
    ...chartJSDatasetTemplate,
  };

  let chart;
  let showIncome = true;

  /**
   * Get expense and income total month-by-month for trailing 12 months
   *
   * @param {Array} transactions all transactions
   * @param {String} filterCategory filter transactions by category if exists
   */
  function getMonthlyOverview(transactions, filterCategory) {
    const today = new Date();
    const indexDate = new Date();
    const data = {
      labels: [],
      expense: [],
      income: [],
    };
    let filteredTransactions = transactions;
    if (filterCategory && filterCategory !== 'All')
      filteredTransactions = transactions.filter(transaction => transaction[3] === filterCategory);
    indexDate.setMonth(indexDate.getMonth() - 11);

    for (let i = 0; i < 12; i++) {
      let monthlyExpense = 0;
      let montlyIncome = 0;
      const indexMonth = indexDate.getMonth();
      const indexYear = indexDate.getFullYear();
      filteredTransactions.forEach(transaction => {
        const transactionDate = transaction[0];
        const isTransfer = transaction[6];
        const expenseAmount = transaction[4];
        const incomeAmount = transaction[5];
        if (!isTransfer) {
          const transactionMonth = transactionDate.getMonth();
          const transactionYear = transactionDate.getFullYear();

          if (transactionMonth === indexMonth && transactionYear === indexYear) {
            monthlyExpense += expenseAmount;
            montlyIncome += incomeAmount;
          }
        }
      });

      const label = utils.isMobileDevice()
        ? `${indexMonth + 1}/${indexYear % 100}`
        : `${utils.months[indexMonth]} - ${indexYear}`;
      data.labels.push(label);
      data.expense.push(monthlyExpense.toFixed(2));
      data.income.push(montlyIncome.toFixed(2));

      indexDate.setMonth(indexDate.getMonth() + 1);
    }

    return data;
  }

  function updateDataset(monthlyData) {
    chart.data.datasets = [
      {
        data: monthlyData.expense,
        ...expenseBarTemplate,
      },
    ];
    if (showIncome) {
      chart.data.datasets.push({
        data: monthlyData.income,
        ...incomeBarTemplate,
      });
    }
    chart.update();
  }

  function updateYearlyOverview(transactions, category) {
    const ctx = document.querySelector('.details__overall canvas');
    const monthlyData = getMonthlyOverview(transactions, category);
    if (chart) {
      updateDataset(monthlyData);
    } else {
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthlyData.labels,
          datasets: [
            {
              data: monthlyData.expense,
              ...expenseBarTemplate,
            },
            {
              data: monthlyData.income,
              ...incomeBarTemplate,
            },
          ],
        },
        options: {
          legend: {
            display: false,
          },
          barThickness: 5,
          scales: {
            xAxes: [
              {
                stacked: true,
              },
            ],
            yAxes: [
              {
                stacked: true,
              },
            ],
          },
        },
      });
    }
  }

  /**
   * Setup dropdown for filtering expenses by each category
   *
   * @param {Array} categories all categories
   * @param {Array} transactions Array of all transactions till date
   */
  function setupCategorySelect(categories, transactions) {
    const el = window.document.querySelector('.details__category__select');
    const option = window.expenseManager.utils.wrapInOption;
    el.appendChild(option('All'));
    categories.forEach(category => el.appendChild(option(category)));

    el.addEventListener('change', () => {
      updateYearlyOverview(transactions, el.value);
    });

    document.querySelector('.details__category--toggle-income').addEventListener('click', () => {
      showIncome = !showIncome;
      updateYearlyOverview(transactions, el.value);
    });
  }

  function init(categories, transactions) {
    setupCategorySelect(categories, transactions);
    updateYearlyOverview(transactions);
  }

  window.expenseManager.yearlyOverview = {
    init,
  };
})();

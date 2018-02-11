(function() {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  let overallChart;

  function getMonthlyExpense(expenses, category) {
    const today = new Date();
    const data = {
      labels: [],
      expense: [],
    };
    const indexDate = new Date();
    indexDate.setMonth(today.getMonth() - 11);

    for (let i = 0; i < 12; i++) {
      let monthlyExpense = 0;
      const indexMonth = indexDate.getMonth();
      const indexYear = indexDate.getFullYear();
      expenses.forEach(expense => {
        const expenseDate = expense[0];
        const expenseCategory = expense[3];
        const isTransfer = expense[6];
        const amount = expense[4];
        if (!isTransfer) {
          const expenseMonth = expenseDate.getMonth();
          const expenseYear = expenseDate.getFullYear();

          if (expenseMonth === indexMonth && expenseYear === indexYear) {
            if (category && category !== "All") {
              if (expenseCategory === category) {
                monthlyExpense += amount;
              }
            } else {
              monthlyExpense += amount;
            }
          }
        }
      })

      if (monthlyExpense) {
        data.labels.push(`${months[indexMonth]} ${indexYear}`);
        data.expense.push(monthlyExpense.toFixed(2));
      }

      indexDate.setMonth(indexDate.getMonth() + 1);
    }

    return data;
  }

  function updateData(chart, data) {
    chart.data.labels = data.labels;
    chart.data.datasets[0].data = data.expense;
    chart.update();
  }

  function ployMontlyExpenseChart(allExpenses, category) {
    const ctx = document.querySelector(".details__overall canvas").getContext('2d');
    const data = getMonthlyExpense(allExpenses, category);
    if (overallChart) {
      updateData(overallChart, data);
    } else {
      overallChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.expense,
            borderWidth: 1
          }]
        },
        options: {
          legend: {
            display: false,
          }
        }
      });
    }
  }

  function setupSelect(categories, allExpenses) {
    const el = window.document.querySelector(".details__category__select");
    const option = window.expenseManager.utils.wrapInOption;
    el.appendChild(option("All"));
    categories.sort().forEach(category => {
      el.appendChild(option(category));
    })

    el.addEventListener("change", () => {
      ployMontlyExpenseChart(allExpenses, el.value)
    });
  }

  function init(categories, allExpenses) {
    setupSelect(categories, allExpenses);
    ployMontlyExpenseChart(allExpenses);
  }

  window.expenseManager.plotCharts = {
    init
  }
})();

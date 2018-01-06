(function() {

  const utils = window.expenseManager.utils;

  function getAllExpenses(sheetID) {
    return new Promise((resolve, reject) => {
      const range = 'Expenses!A2:G';
      gapi.client.sheets.spreadsheets.values
        .get(
          utils.getRequestObj(sheetID, range)
        )
        .then(response => {
           resolve(response.result.values);
        });
    })
  }

  function formatDate(allExpenses) {
    return new Promise((resolve) => {
      resolve(allExpenses.map(expense => {
        const lotusDay = expense[0];
        expense.shift();
        return [utils.convertLotusDayToJSDate(lotusDay), ...expense];
      }))
    })
  }

  function init(sheetID) {
    getAllExpenses(sheetID).then(formatDate).then(allExpenses => {
      console.log(allExpenses);
    })
  }

  window.expenseManager.retrieveData = {
    init
  }
})();

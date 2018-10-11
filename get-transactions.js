(function() {
  const utils = window.expenseManager.utils;

  function getAllTransactions(sheetID) {
    return new Promise((resolve, reject) => {
      const range = 'Expenses!A2:G';
      gapi.client.sheets.spreadsheets.values
        .get(utils.getRequestObj(sheetID, range))
        .then(response => {
          resolve(response.result.values);
        });
    });
  }

  function formatDate(allTransactions) {
    return new Promise(resolve => {
      resolve(
        allTransactions.map(transaction => {
          const lotusDay = transaction[0];
          transaction.shift();
          return [utils.convertLotusDayToJSDate(lotusDay), ...transaction];
        }),
      );
    });
  }

  function init(sheetID) {
    return getAllTransactions(sheetID)
      .then(formatDate)
      .then(allTransactions => {
        // Sort transactions by date
        return allTransactions.sort((a, b) => {
          return b[0] - a[0];
        });
      });
  }

  window.expenseManager.getTransactions = {
    init,
  };
})();

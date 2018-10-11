(function() {
  const utils = window.expenseManager.utils;

  // Cached DOM bindings
  const byID = document.getElementById.bind(document);
  const transferFrom = byID('transfer-form');
  const descriptionEl = byID('transfer-description');
  const dateEl = byID('transfer-date');
  const fromAccountEl = byID('transfer-from-account');
  const toAccountEl = byID('transfer-to-account');
  const amountEl = byID('transfer-amount');
  const saveBtn = byID('save');
  const snackbarContainer = byID('toast-container');

  /**
   * Append transfer log to the expense sheet
   */
  function save(event) {
    if (!transferFrom.checkValidity()) return false;

    event.preventDefault();
    utils.showLoader();

    const expenseDate = dateEl.value;
    const descriptionVal = descriptionEl.value;
    const fromAccountVal = fromAccountEl.value;
    const toAccountVal = toAccountEl.value;
    const amountVal = amountEl.value;

    const dateObj = {
      yyyy: expenseDate.substr(0, 4),
      mm: expenseDate.substr(5, 2),
      dd: expenseDate.substr(-2),
    };
    gapi.client.sheets.spreadsheets.values
      .append(
        utils.appendRequestObj([
          [
            `=DATE(${dateObj.yyyy}, ${dateObj.mm}, ${dateObj.dd})`,
            descriptionVal,
            fromAccountVal,
            'Transfers', // category
            amountVal,   // expense amount
            0,           // income amount
            true,        // is internal transfer?
          ],
          [
            `=DATE(${dateObj.yyyy}, ${dateObj.mm}, ${dateObj.dd})`,
            descriptionVal,
            toAccountVal,
            'Transfers', // category
            0,           // expense amount
            amountVal,   // income amount
            true,        // is internal transfer?
          ],
        ]),
      )
      .then(
        response => {
          // reset fileds
          descriptionEl.value = '';
          amountEl.value = '';
          snackbarContainer.MaterialSnackbar.showSnackbar({
            message: 'Transfer noted!',
          });
          utils.hideLoader();
        },
        response => {
          utils.hideLoader();
          let message = 'Sorry, something went wrong';
          if (response.status === 403) {
            message = 'Please copy the sheet in your drive';
          }
          console.log(response);
          snackbarContainer.MaterialSnackbar.showSnackbar({
            message,
            actionHandler: () => {
              window.open(
                'https://github.com/mitul45/expense-manager/blob/master/README.md#how-to-get-started',
                '_blank',
              );
            },
            actionText: 'Details',
            timeout: 5 * 60 * 1000,
          });
        },
      );
  }

  function init(sheetID, accounts) {
    // set date picker's defalt value as today
    dateEl.value = new Date().toISOString().substr(0, 10);

    // initialize accounts and categories dropdown
    accounts.forEach(account => {
      fromAccountEl.appendChild(utils.wrapInOption(account));
      toAccountEl.appendChild(utils.wrapInOption(account));
    });

    // In MDL - `required` input fields are invalid on page load by default (which looks bad).
    // Fix: https://github.com/google/material-design-lite/issues/1502#issuecomment-257405822
    document.querySelectorAll('*[data-required]').forEach(e => (e.required = true));

    // set lister for `Save` button
    saveBtn.onclick = save;
  }

  window.expenseManager.transferForm = {
    init,
  };
})();

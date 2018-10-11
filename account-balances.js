(function() {
  const accountsTableBody = document.querySelector('.summary__balances tbody');

  function init(accounts) {
    accountsTableBody.innerHTML = '';

    Object.keys(accounts).forEach(account => {
      accountsTableBody.appendChild(
        window.expenseManager.utils.createTR([
          {value: account, className: 'mdl-data-table__cell--non-numeric'},
          {value: accounts[account]},
        ]),
      );
    });
  }

  window.expenseManager.accountBalances = {
    init,
  };
})();

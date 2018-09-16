(function() {

  function showAccountBalances(accounts) {
    const accountsTableBody = document.querySelector(".summary__balances tbody");
    accountsTableBody.innerHTML = "";

    Object.keys(accounts).forEach(account => {
      accountsTableBody.appendChild(
        window.expenseManager.utils.createTR([
          { value: account, className: "mdl-data-table__cell--non-numeric" },
          { value: accounts[account] }
        ])
      )
    })
  }

  function init(accounts, categories, allExpenses) {
    showAccountBalances(accounts);
  }

   window.expenseManager.showAccountBalances = {
    init
  }
})();

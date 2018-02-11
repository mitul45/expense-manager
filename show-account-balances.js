(function() {

  function init(accounts) {
    const accountsTableBody = document.querySelector(".summary__balances tbody");
    accountsTableBody.innerHTML = "";

    Object.keys(accounts).sort().forEach(account => {
      accountsTableBody.appendChild(
        window.expenseManager.utils.createTR([
          { value: account, className: "mdl-data-table__cell--non-numeric" },
          { value: accounts[account] }
        ])
      )
    })
  }

  window.expenseManager.showAccountBalances = {
    init
  }
})();

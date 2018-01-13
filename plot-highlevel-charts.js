(function() {

  function init(accounts, categories, allExpenses) {
    const accountsTableBody = document.querySelector("#accounts tbody");

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

  window.expenseManager.plotHighlevelCharts = {
    init
  }
})();

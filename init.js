(function() {
  const utils = window.expenseManager.utils;

  // Cached DOM bindings
  const byID = document.getElementById.bind(document);
  const authorizeButton = byID("authorize-button");
  const signoutButton = byID("signout-button");
  const forms = byID("forms");
  const formLoader = byID("form-loader");
  const snackbarContainer = byID("toast-container");

  utils.hideLoader = utils.hideLoader.bind(null, forms, formLoader);
  utils.showLoader = utils.showLoader.bind(null, forms, formLoader);

  /**
  *  On load, called to load the auth2 library and API client library.
  */
  function handleClientLoad() {
    gapi.load("client:auth2", initClient);
  }

  /**
  *  Sign in the user upon button click.
  */
  function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
  *  Sign out the user upon button click.
  */
  function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  /**
  *  Initializes the API client library and sets up sign-in state
  *  listeners.
  */
  function initClient() {
    const CLIENT_ID =
      "840179112792-bhg3k1h0dcnp9ltelj21o6vibphjcufe.apps.googleusercontent.com";
    const DISCOVERY_DOCS = [
      "https://sheets.googleapis.com/$discovery/rest?version=v4",
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
    ];

    // Write access for spreadsheet to add expenses, readonly access for drive to find sheet ID
    const SCOPES =
      "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly";

    gapi.client
      .init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
      })
      .then(() => {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick.bind(null);
        signoutButton.onclick = handleSignoutClick.bind(null);
      });
  }

  /**
  *  Called when the signed in status changes, to update the UI
  *  appropriately. After a sign-in, find expense sheet id.
  */
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      onSignin();
    } else {
      utils.showEl(authorizeButton);
      utils.hideEl(signoutButton);
      utils.hideEl(forms);
      utils.hideEl(formLoader);
    }
  }

  /**
  * On successful signin - Update authorization buttons, make a call to get sheetID
  */
  function onSignin() {
    utils.hideEl(authorizeButton);
    utils.showEl(signoutButton);

    getSheetID("Expense Sheet")
      .then(getCategoriesAndAccount, sheetNotFound)
      .then(initApp);

    function sheetNotFound() {
      snackbarContainer.MaterialSnackbar.showSnackbar({
        message: "Cannot find the sheet!",
        actionHandler: () => {
          window.open(
            "https://github.com/mitul45/expense-manager/blob/master/README.md#how-to-get-started",
            "_blank"
          );
        },
        actionText: "Details",
        timeout: 5 * 60 * 1000
      });
    }
  }

  /**
  * Get sheet ID for a given sheet name
  *
  * @param {String} sheetName Sheet name to search in user's drive
  * @returns {Promise} a promise resolves successfully with sheetID if it's available in user's drive
  */
  function getSheetID(sheetName) {
    return new Promise((resolve, reject) => {
      gapi.client.drive.files
        .list({
          q: `name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet'`,
          orderBy: "starred"
        })
        .then(response => {
          if (response.result.files.length === 0) reject();
          else resolve(response.result.files[0].id);
        });
    });
  }

  /**
    * Fetch all accounts, and categories info from spreadsheet
    *
    * @param {String} sheetID Expense sheetID
    */
  function getCategoriesAndAccount(sheetID) {
    return new Promise((resolve, reject) => {
      const ACCOUNT_RANGE = "Data!A2:A50";
      const CATEGORY_RANGE = "Data!E2:E50";

      gapi.client.sheets.spreadsheets.values
        .batchGet(
          utils.batchGetRequestObj(sheetID, [ACCOUNT_RANGE, CATEGORY_RANGE])
        )
        .then(response => {
          const accounts = response.result.valueRanges[0].values[0];
          const categories = response.result.valueRanges[1].values[0];
          resolve({ sheetID, accounts, categories });
        });
    });
  }

  function initApp(data) {
    utils.hideLoader();

    window.expenseManager.expenseForm.init(
      data.sheetID,
      data.accounts,
      data.categories
    );
    window.expenseManager.transferForm.init(data.sheetID, data.accounts);

    utils.appendRequestObj = utils.appendRequestObj.bind(null, data.sheetID);
  }

  window.handleClientLoad = handleClientLoad.bind(null);
})();

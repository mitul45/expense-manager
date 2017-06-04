(function() {
  window.expenseManager = window.expenseManager || {};

  // Cached DOM bindings
  const byID = document.getElementById.bind(document);
  const authorizeButton = byID("authorize-button");
  const signoutButton = byID("signout-button");
  const forms = byID("forms");
  const formLoader = byID("form-loader");
  const snackbarContainer = byID("toast-container");

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
      showEl(authorizeButton);
      hideEl(signoutButton);
      hideEl(expenseForm);
      hideEl(formLoader);
    }
  }

  /**
  * On successful signin - Update authorization buttons, make a call to get sheetID
  */
  function onSignin() {
    hideEl(authorizeButton);
    showEl(signoutButton);

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
        .batchGet(batchGetRequestObj(sheetID, [ACCOUNT_RANGE, CATEGORY_RANGE]))
        .then(response => {
          const accounts = response.result.valueRanges[0].values[0];
          const categories = response.result.valueRanges[1].values[0];
          resolve({ sheetID, accounts, categories });
        });
    });
  }

  function initApp(data) {
    showEl(forms);
    hideEl(formLoader);
    window.expenseManager.expenseForm.init(
      data.sheetID,
      data.accounts,
      data.categories
    );
    window.expenseManager.transferForm.init(data.sheetID, data.accounts);

    window.expenseManager.utils.appendRequestObj = appendRequestObj.bind(
      null,
      data.sheetID
    );
  }

  // utility functions
  function hideEl(el) {
    el.style.display = "none";
  }

  function showEl(el, displayStyle) {
    el.style.display = displayStyle ? displayStyle : "block";
  }

  /**
  * Generate append request object - for given sheet and values to append
  * Docs: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
  *
  * @param {String} spreadsheetId Expense sheet ID
  * @param {Array} values values to be appended
  * @returns {Object} request object for append
  */
  function appendRequestObj(spreadsheetId, values) {
    return {
      // The ID of the spreadsheet to update.
      spreadsheetId,

      // The A1 notation of a range to search for a logical table of data.
      // Values will be appended after the last row of the table.
      range: "Expenses!A1",

      includeValuesInResponse: true,

      responseDateTimeRenderOption: "FORMATTED_STRING",

      responseValueRenderOption: "FORMATTED_VALUE",

      // How the input data should be interpreted.
      valueInputOption: "USER_ENTERED",

      // How the input data should be inserted.
      insertDataOption: "INSERT_ROWS",

      resource: {
        values
      }
    };
  }

  /**
  * Generate batchGet request object - for given sheet, and range.
  * Docs: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchGet
  *
  * @param {String} sheetID Expense sheet ID
  * @param {Array} ranges List of ranges in A1 notation
  * @returns {Object} request object for batchGet
  */
  function batchGetRequestObj(spreadsheetId, ranges) {
    return {
      spreadsheetId,
      ranges,
      dateTimeRenderOption: "FORMATTED_STRING",
      majorDimension: "COLUMNS",
      valueRenderOption: "FORMATTED_VALUE"
    };
  }

  function wrapInOption(option) {
    return `<option value='${option}'>${option}</option>`;
  }

  function showLoader() {
    hideEl(forms);
    showEl(formLoader);
  }

  function hideLoader() {
    hideEl(formLoader);
    showEl(forms);
  }

  window.expenseManager.utils = window.expenseManager.utils || {};
  window.expenseManager.utils.showEl = showEl;
  window.expenseManager.utils.hideEl = hideEl;
  window.expenseManager.utils.wrapInOption = wrapInOption;
  window.expenseManager.utils.loader = {
    show: showLoader,
    hide: hideLoader
  };

  window.expenseManager.elements = window.expenseManager.elements || {};
  window.expenseManager.elements.snackbarContainer = snackbarContainer;

  window.handleClientLoad = handleClientLoad.bind(null);

  // register for service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then(
        registration => {
          // Registration was successful
          console.log(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );
        },
        err => {
          // registration failed :(
          console.log("ServiceWorker registration failed: ", err);
        }
      );
    });
  }
})();

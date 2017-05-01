// Constants

const CLIENT_ID =
  "840179112792-bhg3k1h0dcnp9ltelj21o6vibphjcufe.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];

/**
 * Need write access for spreadsheet to add expenses, Readonly access for drive to find sheet ID
 */
const SCOPES =
  "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly";

const ACCOUNT_RANGE = "Data!A2:A50";
const CATEGORY_RANGE = "Data!E2:E50";

// Cached DOM bindings
const authorizeButton = document.getElementById("authorize-button");
const signoutButton = document.getElementById("signout-button");
const expenseForm = document.getElementById("expense-form");
const description = document.getElementById("description");
const date = document.getElementById("date");
const accountSelect = document.getElementById("account");
const categorySelect = document.getElementById("category");
const amount = document.getElementById("amount");
const income = document.getElementById("is-income");
const formLoader = document.getElementById("form-loader");
const snackbarContainer = document.getElementById("toast-container");

let spreadsheetId = "";

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
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
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
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
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
    expenseForm.style.display = "none";
    formLoader.style.display = "none";
  }
}

/**
 * On successful signin - Update authorization buttons, make a call to get sheetID
 */
function onSignin() {
  authorizeButton.style.display = "none";
  signoutButton.style.display = "block";
  initFields();
  getSheetID("Expense Sheet").then(
    sheetID => {
      expenseForm.style.display = "flex";
      formLoader.style.display = "none";
      spreadsheetId = sheetID;
      updateCategoriesAndAccounts(sheetID);
    },
    () => {
      snackbarContainer.MaterialSnackbar.showSnackbar({
        message: "Cannot find the sheet!",
        actionHandler: () => {
          window.open(
            "https://github.com/mitul45/expense-manager/blob/master/README.md",
            "_blank"
          );
        },
        actionText: "Details",
        timeout: 5 * 60 * 1000
      });
    }
  );
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
 * Apeend expense to the expense sheet
 *
 * @returns {boolean} return false to prevent browser refresh
 */
function addExpense(event) {
  if (!expenseForm.checkValidity()) return false;

  event.preventDefault();
  formLoader.style.display = "block";
  expenseForm.style.display = "none";

  const expenseDate = date.value;
  const dateObj = {
    yyyy: expenseDate.substr(0, 4),
    mm: expenseDate.substr(5, 2),
    dd: expenseDate.substr(-2)
  };

  const description = desc.value;
  const account = accountSelect.value;
  const category = categorySelect.value;
  const amountVal = amount.value;
  const isIncome = income.checked;

  gapi.client.sheets.spreadsheets.values
    .append(
      appendRequestObj(spreadsheetId, [
        [
          `=DATE(${dateObj.yyyy}, ${dateObj.mm}, ${dateObj.dd})`,
          description,
          account,
          category,
          isIncome ? 0 : amountVal,
          isIncome ? amountVal : 0
        ]
      ])
    )
    .then(response => {
      if (response.status !== 200) {
        console.log(response);
        snackbarContainer.MaterialSnackbar.showSnackbar({
          message: "Sorry something went wrong!"
        });
        return;
      }

      // reset fileds
      date.value = "";
      desc.value = "";
      accountSelect.value = "";
      categorySelect.value = "";
      amount.value = "";
      income.checked = false;
      formLoader.style.display = "none";
      expenseForm.style.display = "flex";

      snackbarContainer.MaterialSnackbar.showSnackbar({
        message: "Expense added!"
      });
    });
  return false;
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
 * Fetch all accounts, and categories info from spreadsheet + update them in HTML
 *
 * @param {String} sheetID Expense sheetID
 */
function updateCategoriesAndAccounts(sheetID) {
  gapi.client.sheets.spreadsheets.values
    .batchGet(batchGetRequestObj(sheetID, [ACCOUNT_RANGE, CATEGORY_RANGE]))
    .then(response => {
      const allAccounts = response.result.valueRanges[0].values[0];
      const allCategories = response.result.valueRanges[1].values[0];
      accountSelect.innerHTML = allAccounts.map(wrapInOption).join();
      categorySelect.innerHTML = allCategories.map(wrapInOption).join();
    });
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

// In MDL - `required` input fields are invalid on page load by default (which looks bad).
// Fix: https://github.com/google/material-design-lite/issues/1502#issuecomment-257405822
function initFields() {
  document
    .querySelectorAll("*[data-required]")
    .forEach(e => (e.required = true));
}

(function() {
  /**
   * @param {DOMElement} el
   */
  function hideEl(el) {
    el.style.display = 'none';
  }

  /**
   * @param  {DOMElement} el
   * @param  {String} displayStyle - (optional) flex, inline
   */
  function showEl(el, displayStyle) {
    el.style.display = displayStyle ? displayStyle : 'block';
  }

  /**
   * show loader, hide forms
   */
  function showLoader(forms, charts, loader) {
    hideEl(forms);
    hideEl(charts);
    showEl(loader);
  }

  /**
   * hide loader, show forms
   */
  function hideLoader(forms, charts, loader) {
    hideEl(loader);
    showEl(forms);
    showEl(charts);
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
      range: 'Expenses!A1',

      includeValuesInResponse: true,

      responseDateTimeRenderOption: 'FORMATTED_STRING',

      responseValueRenderOption: 'FORMATTED_VALUE',

      // How the input data should be interpreted.
      valueInputOption: 'USER_ENTERED',

      // How the input data should be inserted.
      insertDataOption: 'INSERT_ROWS',

      resource: {
        values,
      },
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
      dateTimeRenderOption: 'FORMATTED_STRING',
      majorDimension: 'COLUMNS',
      valueRenderOption: 'UNFORMATTED_VALUE',
    };
  }

  /**
   * Generate get request object - for given sheet, and range.
   * Docs: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
   *
   * @param {String} sheetID Expense sheet ID
   * @param {String} range in A1 notation
   * @returns {Object} request object for get
   */
  function getRequestObj(spreadsheetId, range) {
    return {
      spreadsheetId,
      range,
      dateTimeRenderOption: 'SERIAL_NUMBER',
      majorDimension: 'ROWS',
      valueRenderOption: 'UNFORMATTED_VALUE',
    };
  }

  function wrapInOption(option) {
    const optionEl = document.createElement('option');
    optionEl.value = option;
    optionEl.innerHTML = option;
    return optionEl;
  }

  function createTR(items) {
    const TR = document.createElement('tr');
    items.forEach(item => {
      const TD = document.createElement('td');
      TD.innerHTML = item.value;
      if (item.className) TD.classList.add(item.className);
      TR.appendChild(TD);
    });
    return TR;
  }

  /**
   * Excel/Google Sheets returns date in Lotus format.
   * References: https://developers.google.com/sheets/api/reference/rest/v4/DateTimeRenderOption
   *
   * @param {Number} lotusDay - Number of days passed since December 30th 1899.
   * @returns {Date} Javascript date object of the same day
   */
  function convertLotusDayToJSDate(lotusDay) {
    lotusDay = window.parseInt(lotusDay);
    let date = new Date(1899, 11, 30);
    date.setDate(date.getDate() + lotusDay);
    return date;
  }

  function sortBy(key, a, b) {
    return b[key] - a[key];
  }

  /**
   * Stackoverflow: https://stackoverflow.com/a/11381730
   */
  function isMobileDevice() {
    let check = false;
    (function(a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a,
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4),
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const COLORS = [
    '#f1a9a0',
    '#6c7a89',
    '#ec644b',
    '#f1e7fe',
    '#d2527f',
    '#f22613',
    '#aea8d3',
    '#cf000f',
    '#96281b',
    '#736598',
    '#8c14fc',
    '#81cfe0',
    '#a537fd',
    '#4d05e8',
    '#913d88',
    '#336e7b',
    '#34495e',
    '#19b5fe',
    '#2574a9',
    '#c8f7c5',
    '#7befb2',
    '#2ecc71',
    '#29f1c3',
    '#1e824c',
    '#91b496',
    '#ffffcc',
    '#f4f776',
    '#f0ff00',
    '#fcb941',
    '#e47833',
    '#d35400',
    '#bdc3c7',
    '#95a5a6',
    '#67809f',
    '#2e3131',
  ];
  let categoryColor = {};
  let accountColor = {};

  function setColorsForEachCategory(categories) {
    categories.forEach((category, index) => {
      categoryColor[category] = COLORS[index];
    });
  }

  function setColorsForEachAccount(accounts) {
    accounts.forEach((account, index) => {
      accountColor[account] = COLORS[index];
    });
  }

  function getColorsForCategories(categories) {
    return categories.map(category => categoryColor[category]);
  }

  function getColorsForAccounts(accounts) {
    return accounts.map(account => accountColor[account]);
  }

  window.expenseManager = window.expenseManager || {};
  window.expenseManager.utils = window.expenseManager.utils || {
    showEl,
    hideEl,
    hideLoader,
    showLoader,
    wrapInOption,
    batchGetRequestObj,
    getRequestObj,
    appendRequestObj,
    createTR,
    convertLotusDayToJSDate,
    months,
    sortBy,
    isMobileDevice,
    setColorsForEachCategory,
    setColorsForEachAccount,
    getColorsForCategories,
    getColorsForAccounts,
  };
})();

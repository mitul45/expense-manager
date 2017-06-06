# 💸 expense-manager [![Build Status](https://travis-ci.org/mitul45/expense-manager.svg?branch=master)](https://travis-ci.org/mitul45/expense-manager)

_"If you can't measure it, you can't improve it."_ - [Peter Drucker](https://en.wikipedia.org/wiki/Peter_Drucker)  

Take control back. Introducing Expense Manager, an app to track your daily spendings. It is made of two main components:
1. [Main application](https://mitul45.github.io/expense-manager/): Used to add expenses to the sheet
2. [Expense Sheet](https://docs.google.com/spreadsheets/d/1NfF1A0UC6qLuOE7eiTsAzNVAskNcYeuPHAkzSURH0Pc/edit#gid=0): This is where you can do all kinds of analysis/summarization of your expenses.

Why? Because Google Sheets is really good with numbers, but entering data from the mobile app is [not very convenient](http://i.imgur.com/NfaGKEI.gifv). The idea is to make adding expense [as simple as it can be](http://i.imgur.com/tg6UzFe.gifv). You should add them at the same moment you make a transaction. Make it like a habit.

Detailed analysis of the sheet can be deferred till you get an access to a computer. You can plot fancy charts at end of the month, set the budget for next week, etc. And I feel all of that need not necessarily be done on small screen.

## Features
- Built for the web - works cross-platform (iOS, Android, Mac, Windows, Linux).  
- Uses [Google Sheet](https://docs.google.com/spreadsheets/d/1NfF1A0UC6qLuOE7eiTsAzNVAskNcYeuPHAkzSURH0Pc/edit?usp=sharing) as a database to store expenses. **Why?**  
    1. Privacy. It's your personal data. It should belong to you.  
    1. Sheets is [way better](https://www.google.co.in/search?q=cool+things+you+can+do+with+excel&oq=cool+things+your+can+do+with+ex&aqs=chrome.1.69i57j0l5.10138j0j4&sourceid=chrome&ie=UTF-8#q=cool+things+you+can+do+with+google+sheets) at handling numbers than me. You can do all kinds of analysis using graphs, formulas, etc.  
    1. I didn't want to write backend :nerd_face:
- [`Progressive Web App`](https://developers.google.com/web/progressive-web-apps/) - Quick to load, can be installed as a standalone app on phone.  
- Easier sharing. Sharing expenses with someone (wife, family)? [Share](https://support.google.com/docs/answer/2494822?co=GENIE.Platform%3DDesktop&hl=en) the expense sheet and all of your combined data belongs to the single sheet.  
- Backup. Didn't I tell you it uses Google Sheets to store expenses? Your data is always backed up on :partly_sunny:
- [Mobile friendly](http://i.imgur.com/vqz7zDA.png) layout.  
- [NEW] Supports internal amount transfer enteries (things like withdrawing cash, investing to an retirement account, etc)

## How to get started
1. Copy this [sheet](https://docs.google.com/spreadsheets/d/1NfF1A0UC6qLuOE7eiTsAzNVAskNcYeuPHAkzSURH0Pc/edit?usp=sharing) to your Google Drive. After sign in, choose `File -> Make a Copy...`.  
 ![Make a Copy](http://i.imgur.com/qpLUsmY.png)
1. Don't rename it. It should be named `Expense Sheet`.  
 ![Expense Sheet](http://i.imgur.com/ncOBzsa.png)
1. Update categories, account names, initial values in [Data sheet](https://docs.google.com/spreadsheets/d/1NfF1A0UC6qLuOE7eiTsAzNVAskNcYeuPHAkzSURH0Pc/edit#gid=1956004401). Clear our sample expenses in the first sheet.
1. That's it! You can start adding expenses now.

### Permissions
- Read access to Google Drive to find `Expense Sheet`.
- Read and write access to Google Sheets to add expenses.

## Check it out
https://mitul45.github.io/expense-manager/ :rocket:

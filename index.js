import fs from "node:fs";
import { Command } from "commander";

class Expense {
  constructor(id, description, amount, category = null) {
    this.id = id;
    this.description = description;
    this.amount = amount;
    this.category = category;
  }
}

const program = new Command();
program
  .name("expense_tracker")
  .description("CLI to track expenses")
  .version("1.0.0");

// Create expenses file
program
  .command("create")
  .description("Create expenses file")
  .action(() => {
    createExpensesFile();
  });

// CRUDing Commands
// Create an expense command
program
  .command("add")
  .description("Add a new expense")
  .option("-d, --description <string>", "Description of the expense")
  .option("-a, --amount <number>", "Amount of the expense")
  .action((expense) => {
    // Error Handeling & input validation
    try {
      checkExpensesFile();
      inputIsValid(expense);
      addExpense(expense);
    } catch (error) {
      console.log(error.message);
    }
  });

// Update an expense command
program
  .command("update")
  .description("Update an existing expense")
  .option("-i, --id <number>", "The expense id")
  .option("-d, --description [string]", "Description of the expense")
  .option("-a, --amount [number]", "Amount of the expense")
  .action((expense) => {
    // Error Handeling & input validation
    try {
      checkExpensesFile();
      getExpense(expense.id);
      inputIsValid(expense);
      updateExpense(expense);
    } catch (error) {
      console.log(error.message);
    }
  });
// Read all/an expense(s) command
// Delete an expense command
program.parse(process.argv);

// Creating expenses file
function createExpensesFile() {
  if (!fs.existsSync("expenses.json")) {
    fs.writeFileSync(
      "expenses.json",
      JSON.stringify({
        expenses: [],
        categories: [],
        length: 0,
        currentID: 1,
      }),
    );
    isSuccessful(`Expenses file was created!`, true);
  } else {
    console.log(`Expenses file already exist!`);
  }
}
// Fetching expenses file
function getExpensesFile() {
  return JSON.parse(fs.readFileSync("expenses.json", "utf-8"));
}

// CRUDing Methods
// Create an expense method
function addExpense(expense) {
  let expenses = getExpensesFile();
  let expenseObj = new Expense(
    expenses.currentID,
    expense.description,
    expense.amount,
  );
  expenses.expenses.push(expenseObj);
  expenses.length += 1;
  expenses.currentID += 1;
  fs.writeFileSync("expenses.json", JSON.stringify(expenses));
  isSuccessful("Expense was added", true);
}
// Update an expense method
function updateExpense(expense) {
  let index = getExpense(expense.id);
  let expenses = getExpensesFile();
  if (expense.description == undefined) {
    expenses.expenses[index].amount = expense.amount;
  } else if (expense.amount == undefined) {
    expenses.expenses[index].description = expense.description;
  } else {
    expenses.expenses[index].amount = expense.amount;
    expenses.expenses[index].description = expense.description;
  }
  fs.writeFileSync("expenses.json", JSON.stringify(expenses));
  isSuccessful("Expense was updated", true);
}
// Read all/an expense(s) method
// Delete an expense method

// Feedback methods
function isSuccessful(msg, flag) {
  if (flag) {
    console.log(`Operation successful! ${msg}`);
  } else {
    throw new Error(`Operation failed! ${msg}`);
  }
}

// Input validation method
function inputIsValid(expense) {
  if (expense.amount != undefined && expense.amount <= 0) {
    return isSuccessful("Amount can't be equal or less than 0", false);
  } else if (expense.description == "") {
    return isSuccessful("Description can't be empty", false);
  } else if (expense.amount == undefined && expense.description == undefined) {
    return isSuccessful(
      "To update an expense, description and amount can't be both undefined",
      false,
    );
  } else {
    return true;
  }
}

// Search for an expense
function getExpense(expenseID) {
  let expenses = getExpensesFile();
  let index = expenses.expenses.findIndex((expense) => expense.id == expenseID);
  if (index >= 0) {
    return index;
  } else {
    isSuccessful(`Expense with id ${expenseID} was not found!`, false);
  }
}

function checkExpensesFile() {
  if (!fs.existsSync("expenses.json")) {
    isSuccessful(
      `The expenses file doesn't exist. Run the \`create\` command to intialize one`,
      false,
    );
  }
}

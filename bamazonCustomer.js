var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw (err);
    console.log("connected as: " + connection.threadID)
    welcome()
});

function welcome() {
    inquirer.prompt([{
        type: "list",
        name: "welcome",
        message: "welcome to bamazon like amazon but better! how would you like to begin? \n(If you don't know product ID #'s, select the first option)",
        choices: ["See a list of products", "begin shopping"]
    }]).then(function (firstChoice) {
        if (firstChoice.welcome === "See a list of products") {
            productList();
        } else {
            promptCustomer();
        }
    })
}

function productList() {
    connection.query("SELECT * FROM bamazon_products", function (err, data) {
        if (err) throw err;
        console.log("Below is a list of our current products!")
        for (var i = 0; i < data.length; i++) {
            console.log(data[i].id + " | " + data[i].product_name + " | " + data[i].department_name + " | $" + data[i].price + " | In-Stock: " + data[i].stock_quantity);
        }
        console.log("");
        keepShopping();
    });
}

function keepShopping() {
    inquirer.prompt([{
        type: "list",
        name: "keepShopping",
        message: "Are you ready to begin shopping?",
        choices: ["Yes", "No"]
    }]).then(function (keepGoing) {
        if (keepGoing.keepShopping === "Yes") {
            promptCustomer();
        } else {
            console.log("Thank you for visitin bamazon like amazon but better!")
            connection.end();
        }
    })
}

function promptCustomer() {
    connection.query("SELECT * FROM bamazon_products", function (err, data) {
        if (err) throw err;
        inquirer.prompt([{
                type: "input",
                name: "products",
                message: "What item would you like to purchase? (choose by ID #)",
            },
            {
                type: "input",
                name: "quantity",
                message: "How many would you like to purchase?"
            }
        ]).then(function (answer) {
            let quantity = parseInt(answer.quantity);
            let productChosen = parseInt(answer.products)
            connection.query('SELECT * FROM bamazon_products', function (err, data) {
                if (err) throw err;
                for (let i = 0; i < data.length; i++) {
                    if (quantity <= data[i].stock_quantity && productChosen === data[i].id) {
                        console.log("Thank you! For purchasing " + quantity + " " + data[i].product_name + "(s), your total comes to " + quantity * data[i].price + "!");
                        connection.query("UPDATE bamazon_products SET ? WHERE ?", function (err, res) {
                            [{
                                stock_quantity: data[i].stock_quantity - quantity
                            }]
                        })
                        console.log("You now have " + data[i].stock_quantity + " of " + data[i].product_name);
                        keepGoing();
                    } else if (quantity > data[i].stock_quantity && productChosen === data[i].id) {
                        inquirer.prompt([{
                            type: "list",
                            name: "tooMany",
                            message: "I'm sorry, we don't currently have enough in stock to fill your order. How would you like to proceed?",
                            choices: ["Purchase a different quantity", "Purchase a different product", "Stop shopping"]
                        }]).then(function (overQuantity) {
                            if (overQuantity.tooMany === "Purchase a different quantity" || overQuantity.tooMany === "Purchase a different product") {
                                promptCustomer();
                            } else {
                                console.log("Thank you for visiting Bamazon! Have a wonderful day!");
                                connection.end();
                            }
                        });
                    }
                }
            });
        });
    });
}

function keepGoing() {
    inquirer.prompt([
        {
            type: "list",
            name: "shopping",
            message: "Would you like to continue shopping?",
            choices: ["Yes", "No"]
        }
    ]).then(function (goOn) {
        if (goOn.shopping === "Yes") {
            promptCustomer();
        } else {
            console.log("Thank you for visiting Bamazon! Have a wonderful day!");
        }
    });
}

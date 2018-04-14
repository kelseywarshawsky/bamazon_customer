var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.CreateConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "0108C@denc3",
    database: "bamazon"
});

var productArray = [];

function products() {
    connection.query("SELECT * FROM bamazon_products", function (err, data) {
        if (err) throw err;
        for (i = 0; i < data.length; i++) {
            console.log(data[i]);
        }
    }
    )}; 

    
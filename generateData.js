const faker = require('faker');
const fs = require('fs');

const database = { products: [] };

for (let i = 1; i <= 1000; i++) {
    database.products.push({
        id: i,
        name: faker.random.words(),
        cost: Math.random() * 100,
        quantity: Math.random() * 1000
    });
}

const jsonString = JSON.stringify(database, null, 2);

fs.writeFile("./db.json", jsonString, function (err) {
    if (err) {
        return console.error(err);
    }
    console.log("The file was saved!");
});
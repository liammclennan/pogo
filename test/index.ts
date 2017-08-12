import * as assert from "assert";
import * as pogo from "../index";

var db = pogo.connection({
    "host": "localhost",
    "port": 5432,
    "database": "pogotest",
    "user": "pogotest",
    "password": "pogotest"
});

async function insertPerson() {
    var person = {
        id: pogo.generateKey(new Date()),
        name: "Eric Blair",
        age: 34,
        tableName: "person"
    };

    let ops = [{
        operation: "INSERT",
        values: [person]
    } as pogo.Delta];

    await db.commit(ops);
    let people = await db.query("select * from person where id = $1", [person.id]);
    assert.equal(people.length, 1);
    let personQueried = people[0];
    personQueried.age = 987657;
    return db.commit([{
        operation: "UPDATE",
        values: [personQueried]
    }]);
}

function insert100() {
    let values = [];
    for (var i = 0; i < 100; i++) {
        values.push({
            id: pogo.generateKey(new Date()),
            name: "Eric Blair",
            age: i,
            tableName: "person"
        } as pogo.Persisted);
    }

    let ops = [{ operation: "INSERT", values } as pogo.Delta];

    return db.commit(ops).then((r) => {
        return db.query("select data from person where data @> $1", [{ age: 72 }]);
    });
}

function insertReadDelete() {
    let values = [];
    for (var i = 0; i < 100; i++) {
        values.push({
            id: pogo.generateKey(new Date()),
            name: "Deleto",
            age: i,
            tableName: "person"
        } as pogo.Persisted);
    }

    let ops = [{ operation: "INSERT", values } as pogo.Delta];

    return db.commit(ops).then(() => {
        return db.query("select data from person where data @> $1", [{ name: "Deleto" }])
            .then((people) => {
                assert.equal(people.length, 100);
                return db.commit([{ operation: "DELETE", values: people }]);
            }).then(() => {
                return db.query("select data from person where data @> $1", [{ name: "Deleto" }]);
            }).then((rows) => {
                assert.equal(rows.length, 0);
            });
    });
}

insertPerson()
    .then(insert100)
    .then(insertReadDelete)
    .then(() => { db.end(); })
    .catch((error) => { db.end(); throw error; });
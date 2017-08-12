Pogo
====

Bit of **Po**stgresql + bit of Mon**go**DB = Pogo

Pogo is a document style node.js client for Postgresql. Working with documents (JSON) instead of relations (tables) will simplify development when your data model includes a lot of one-to-many relationships and few many-to-many relationships. 

To work with Pogo:

1. Install dependencies
    ```
    yarn install
    ```
    or 
    ```
    npm install
    ```

1. Create a database connection to a Postgresql database. 
    ```javascript
    import * as pogo from "pogo";

    const db = pogo.connection({
        "host": "localhost",
        "port": 5432,
        "database": "pogotest",
        "user": "pogotest",
        "password": "pogotest"
    });
    ```

1. Put some database operations (INSERT, UPDATE or DELETE) into an array.
    ```javascript
    let operations = [];

    let person = {
        id: pogo.generateKey(new Date()),
        name: "Eric Blair",
        age: 34,
        tableName: "person"
    };

    operations.push({
        operation: "INSERT",
        values: [person]
    });

    let updatedPerson = Object.assign({}, person, { age: 35 });

    operations.push({
        operation: "UPDATE",
        values: [updatedPerson]
    });
    ```
    NB: The objects persisted must have a string id (preferrably populated by `pogo.generateKey(new Date())` and a `tableName` property identifying the database table to save them to.  

1. Tell Pogo to commit the operations in a single transaction.
    ```javascript
    let resultPromise = db.commit(operations);
    ```

1. Query using Postgresql select statements.
    ```javascript
    let personById = db.query("select * from person where id = $1", [person.id]);

    let personByExample = db.query("select * from person where data @> $1", [{"age": 35}]);
    ```

For more examples see `test/`.

[Indexing JSON in Postgresql](https://cgi.cse.unsw.edu.au/~cs9315/16s1/postgresql/documentation/datatype-json.html#JSON-INDEXING)

Similar Projects
------

* [Marten](http://jasperfx.github.io/marten/)
* [SqlDoc](https://github.com/liammclennan/sqldoc)

Notes
------

Pogo depends on [pg-promise](https://github.com/vitaly-t/pg-promise). The query syntax is the same as pg-promise so [their examples](https://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example) are helpful. 


import * as pgpFactory from "pg-promise";

export type CrudOp = "INSERT" | "UPDATE" | "DELETE";

export type LexString = string

export interface Persisted {
    id: LexString;
    tableName: string;
}

export interface Delta {
    operation: CrudOp;
    values: Persisted[];
}

export function generateKey(now: Date): LexString {
    return `${now.getTime()}${Math.random().toString(36).substring(2,5)}`;
}

export function connection(config: any) {
    const pgp = pgpFactory(); 
    const db = pgp(config);
    return {
        commit: function commit(deltas: Delta[]) {
            return db.tx(t => {
                var results = [].concat.apply([], deltas.map((delta) => executeDelta(t, delta)));
                return results;
            });
        },
        query: function query(query: string, values?: any) {
            return db.any(query, values)
                .then((rows) => rows.map((r) => r.data));
        },
        end: function end () {
            pgp.end();
        },
        db
    };

    function executeDelta(t:pgpFactory.ITask<any>, delta: Delta) {
        switch (delta.operation) {
            case "INSERT":
                return executeInserts(t, delta.values);
            case "UPDATE":
                return executeUpdates(t, delta.values);
            case "DELETE":
                return executeDelete(t, delta.values);
            default:
        }
    }
    
    function executeInserts(t: pgpFactory.ITask<any>, valuesToInsert: Persisted[]) {
        return valuesToInsert.map((o) => {
            return t.none("INSERT INTO " + o.tableName + " (id, data) values (${id}, ${this})", o)
                .catch((error) => {
                    throw error;
                });
        });
    }

    function executeUpdates(t: pgpFactory.ITask<any>, valuesToUpdate: Persisted[]) {
        return valuesToUpdate.map((o) => {
            const sql = "UPDATE " + o.tableName + " set data = $2 where id = $1";
            return t.none(sql, [o.id, o])
                .catch((error) => {
                    throw error;
                });
        });
    }

    function executeDelete(t: pgpFactory.ITask<any>, valuesToDelete: Persisted[]) {
        return valuesToDelete.map((o) => {
            return t.none(`DELETE FROM ${o.tableName} WHERE id = $1`, [o.id]);
        });
    }
    
}





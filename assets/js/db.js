var dbPromise = idb.openDB('postsdb', 1, {
    upgrade(db) {
        // Create a store of objects
        const store = db.createObjectStore('posts-to-send', {
            // The 'id' property of the object will be the key.
            keyPath: 'id',
            // If it isn't explicitly set, create a value by auto incrementing.
            // autoIncrement: true,
        });
    },
});


function writeData(st, data) {
    return dbPromise
        .then(function (db) {
            var transaction = db.transaction(st, 'readwrite');
            var store = transaction.objectStore(st);
            store.put(data);
            return transaction.complete;
        });
}
function readStoreData(st) {
    return dbPromise
        .then(function (db) {
            console.log('The db ', db)
            var transaction = db.transaction(st, 'readonly');
            var store = transaction.objectStore(st);
            return store.getAll();
        });
}

function deleteItemFromStore(st, id) {
    dbPromise
        .then(function (db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.delete(id);
            return tx.complete;
        })
        .then(function () {
            console.log('Item deleted!');
        });
}
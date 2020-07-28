const {
    CreateConnection
} = require('./connection');
const {
    default: Logger
} = require('../logger/log');
const logger = new Logger({
    isPretty: true
});

function InsertEntity(record) {
    let connection = CreateConnection();
    connection.connect((err) => {
        if(err) {
            return cb(err);
        }
        connection.query('INSERT INTO Transactions SET ?', record, (error) => {
            if (error) {
                logger.error(error);
            }
            return connection.end();
        });
    });
}

module.exports = {
    InsertEntity
}
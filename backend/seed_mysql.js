const mysql = require('mysql2');

const configs = [
  { host: 'localhost', user: 'root', password: 'pass-885@22', database: 'pghub' },
  { host: '127.0.0.1', user: 'root', password: 'pass-885@22', database: 'pghub' },
  { host: 'localhost', user: 'root', password: 'pass-885@22' },
  { host: 'localhost', user: 'pghub', password: 'pass-885@22', database: 'pghub' }
];

async function testAll() {
    for (let c of configs) {
        console.log(`Testing: ${c.user}@${c.host} (DB: ${c.database || 'none'})`);
        try {
            await new Promise((resolve, reject) => {
                const conn = mysql.createConnection(c);
                conn.connect((err) => {
                    if (err) reject(err);
                    else {
                        console.log('SUCCESS!!');
                        conn.end();
                        resolve();
                    }
                });
            });
            return;
        } catch (e) {
            console.log(`Failed: ${e.message}\n`);
        }
    }
}
testAll();

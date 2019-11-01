module.exports = {
    test: {
        client: 'pg',
        version: '10.0',
        connection: {
            host: 'localhost',
            user: 'postgres',
            password: '',
            database: 'node',
        },
        migrations: {
            directory: 'src/migrations',
        },
    },
};
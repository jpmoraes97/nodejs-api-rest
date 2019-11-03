const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

ROUTE = '/v1/transactions';

let user;
let user2;
let accUser;
let accUser2;

beforeAll(async () => {
    await app.db('transactions').del();
    await app.db('accounts').del();
    await app.db('users').del();
    const users = await app.db('users').insert([
        {name: 'User #1', mail: 'user@mail.com', password: '$2a$10$LC/zZYtHRJy1t.Nf47zXE.GwXn4mS1d0HRVOyCdaSbd8eoH24nfSe'},
        {name: 'User #2', mail: 'user2@mail.com', password: '$2a$10$LC/zZYtHRJy1t.Nf47zXE.GwXn4mS1d0HRVOyCdaSbd8eoH24nfSe'}
    ], '*');
    [user, user2] = users;
    delete user.password;
    user.token = jwt.encode(user, 'segredo');

    const accs = await app.db('accounts').insert([
        {name: 'Acc User #1', user_id: user.id},
        {name: 'Acc User #2', user_id: user2.id}
    ], '*');
    [accUser, accUser2] = accs;
});


test('Deve listar apenas as transações do usuário', () => {
    return app.db('transactions').insert([
        {description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id},
        {description: 'T2', date: new Date(), ammount: 300, type: 'O', acc_id: accUser2.id}
    ]).then(() => request(app).get(ROUTE)
    .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].description).toBe('T1');
    });
});

test('Devo inserir uma transação com sucesso', () => {
    return request(app).post(ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({description: 'New Transaction', date: new Date(), ammount: 230, type: 'I', acc_id: accUser.id})
    .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.acc_id).toBe(accUser.id);
        expect(res.body.ammount).toBe('230.00');
    });
});

test('Transacoes de entrada devem ser positivas', () => {
    return request(app).post(ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({description: 'New Transaction', date: new Date(), ammount: -230, type: 'I', acc_id: accUser.id})
    .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.acc_id).toBe(accUser.id);
        expect(res.body.ammount).toBe('230.00');
    });
});

test('Transacoes de saida devem ser negativas', () => {
    return request(app).post(ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({description: 'New Transaction', date: new Date(), ammount: 230, type: 'O', acc_id: accUser.id})
    .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.acc_id).toBe(accUser.id);
        expect(res.body.ammount).toBe('-230.00');
    });
});

test('Nao deve inserir uma transacao sem descricao', () => {
    return request(app).post(ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({date: new Date(), ammount: 230, type: 'I', acc_id: accUser.id})
    .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Descricao e um atributo obrigatorio');
    });
});

test('Nao deve inserir uma transacao sem valor', () => {
    return request(app).post(ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({description: 'Desc', date: new Date(), type: 'I', acc_id: accUser.id})
    .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Valor e um atributo obrigatorio');
    });
});




test('Deve retornar uma transação por ID', () => {
    return app.db('transactions').insert(
        {description: 'Return Transaction', date: new Date(), ammount: 230, type: 'I', acc_id: accUser.id},['id'])
        .then(res => request(app).get(`${ROUTE}/${res[0].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .then(result => {
            expect(result.status).toBe(200);
            expect(result.body.id).toBe(res[0].id);
            expect(result.body.description).toBe('Return Transaction');
        }));
});

test('Deve alterar uma transacao', () => {
    return app.db('transactions').insert(
        {description: 'Update Transaction', date: new Date(), ammount: 230, type: 'I', acc_id: accUser.id},['id'])
        .then(res => request(app).put(`${ROUTE}/${res[0].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({description: 'Updated Transac'})
        .then(result => {
            expect(result.status).toBe(200);
            expect(result.body.id).toBe(res[0].id);
            expect(result.body.description).toBe('Updated Transac');
        }));
});

test('Deve remover uma transacao', () => {
    return app.db('transactions').insert(
        {description: 'Delete Transaction', date: new Date(), ammount: 230, type: 'I', acc_id: accUser.id},['id'])
        .then(res => request(app).delete(`${ROUTE}/${res[0].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .then(result => {
            expect(result.status).toBe(204);
        }));
});

test('Nao deve remover uma transacao de outro user', () => {
    return app.db('transactions').insert(
        {description: 'Delete Transaction', date: new Date(), ammount: 230, type: 'I', acc_id: accUser2.id},['id'])
        .then(res => request(app).delete(`${ROUTE}/${res[0].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .then(result => {
            expect(result.status).toBe(403);
            expect(result.body.error).toBe('Este recurso nao te pertence');
        }));
});

test('Nao deve remover uma conta com transacao associada', () => {
    return app.db('transactions').insert(
        {description: 'Delete account with transaction', date: new Date(), ammount: 230, type: 'I', acc_id: accUser.id},['id'])
        .then(() => request(app).delete(`/v1/accounts/${accUser.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .then(result => {
            expect(result.status).toBe(400);
            expect(result.body.error).toBe('Essa conta possui transacoes associadas');
        }));
});


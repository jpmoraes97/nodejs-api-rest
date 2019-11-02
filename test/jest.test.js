test('Devo conhecer as principais assertivas do jest', () => {
    let number = 12;
    expect(number).not.toBeNull();
    expect(number).toBe(12);
    expect(number).toEqual(12);
    expect(number).toBeGreaterThan(9)
    expect(number).toBeLessThan(13);
});

test('Devo saber trabalhar com objetos', () => {
    const obj = {name: 'John Node', mail: 'johnnode@mail.com'};
    expect(obj).toHaveProperty('name');
    expect(obj).toHaveProperty('name', 'John Node');

    const obj2 = {name: 'John Node', mail: 'johnnode@mail.com'};
    //expect(obj).toBe(obj2);
        //expect(obj).toBe(obj2);
        //expect(obj).toBe(obj2);


    expect(obj).toBe(obj);
    expect(obj.name).toBe('John Node');
});

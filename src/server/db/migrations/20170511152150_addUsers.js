exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', (table) => {
        table.uuid('user_id').notNullable().primary();
        table.string('name');
        table.string('username').index().unique().notNullable();
        table.string('password').notNullable();
        table.boolean('admin').defaultTo(false);
        table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
        table.integer('commune_id').unsigned().references('commune_id').inTable('communes');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};

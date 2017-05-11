exports.up = function(knex, Promise) {
    return knex.schema.createTable('tasks', (table) => {
        table.increments('task_id').primary();
        table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
        table.integer('chore_id').unsigned().references('chore_id').inTable('chores').onDelete('CASCADE');
        table.integer('user_id').unsigned().references('user_id').inTable('users').onDelete('CASCADE');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('tasks');
};

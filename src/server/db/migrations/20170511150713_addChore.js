
exports.up = function(knex, Promise) {
  return knex.schema.createTable('chores', (table) => {
    table.increments('chore_id').primary();
    table.string('name').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.integer('commune_id').unsigned().references('commune_id').inTable('communes').onDelete('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('chores');
};

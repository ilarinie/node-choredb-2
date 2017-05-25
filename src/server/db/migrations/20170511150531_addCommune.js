
exports.up = function(knex, Promise) {
  return knex.schema.createTable('communes', (table) => {
    table.increments('commune_id').primary();
    table.string('name').unique().notNullable();
    table.string('telegram_channel_id');
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('communes');
};

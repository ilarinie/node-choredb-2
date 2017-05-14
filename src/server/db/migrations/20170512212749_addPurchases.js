
exports.up = function(knex, Promise) {
  return knex.schema.createTable('purchases', (table) => {
      table.increments('purchase_id').primary();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.decimal('amount').notNullable();
      table.string('description').notNullable();
      table.integer('commune_id').unsigned().references('commune_id').inTable('communes').onDelete('CASCADE');
      table.integer('user_id').unsigned().references('user_id').inTable('users').onDelete('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('purchases');
};

const { AbilityBuilder, createMongoAbility } = require('@casl/ability');

const policies = {
  ADMIN(user, { can }) {
    can('manage', 'all');
  },

  PENJAGA(user, { can }) {
    can('create', 'Book');

    can('read', 'Book');

    can('update', 'Book');

    can('delete', 'Book');

    can('get', 'Request');

    can('approve', 'Request');

    can('reject', 'Request');

    can('get', 'Borrower');
  },

  PEMINJAM(user, { can }) {
    can('read', 'Book');

    can('create', 'Pinjaman');

    can('get', 'Pinjaman');

    can('return', 'Book');
  },
};

const policyFor = (user) => {
  let { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user && typeof policies[user.role] === 'function') {
    policies[user.role](user, { can });
  }

  return build();
};

module.exports = {
  policyFor,
};

import type { Knex } from 'knex';
import { BcryptPasswordHasher } from '../../security/bcrypt-password-hasher.js';

const DEV_USER = {
  name: 'Usuário de Teste',
  email: 'teste@shifty.dev',
  password: 'Shifty123',
  phone: '49999990000',
  birthDate: '1995-06-15',
};

/** Recria o usuário de teste do zero; o ON DELETE CASCADE leva junto os dados antigos dele. */
export async function seed(knex: Knex): Promise<void> {
  await knex('users').where({ email: DEV_USER.email }).delete();
  await knex('users').insert({
    name: DEV_USER.name,
    email: DEV_USER.email,
    password_hash: await new BcryptPasswordHasher(10).hash(DEV_USER.password),
    phone: DEV_USER.phone,
    birth_date: DEV_USER.birthDate,
    privacy_consent_at: knex.fn.now(),
  });
}

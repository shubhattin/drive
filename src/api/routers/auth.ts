import { publicProcedure, t } from '../trpc_init';
import { z } from 'zod';
import { JWT_SECRET } from '@tools/jwt.server';
import jwt from 'jsonwebtoken';
import { base_get, base_put } from '@tools/deta';
import * as bcrypt from 'bcrypt';
import ms from 'ms';
import { dattStruct } from '@langs/model';
import { get_zod_key_enum } from '@tools/zod_enum';
import { gen_salt, hash_256, puShTi } from '@tools/hash';

const ID_TOKREN_EXPIRE = ms('10days') / 1000; // so if not opened for 10 consecutive days will be logged out
const ACCESS_TOKEN_EXPIRE = ms('12hrs') / 1000;

export const USERS_INFO_DRIVE_LOC = 'drive_users';

const get_id_and_aceess_token = (username: string) => {
  const id_token = jwt.sign({ user: username, type: 'login' }, JWT_SECRET, {
    expiresIn: ID_TOKREN_EXPIRE
  });
  const access_token = jwt.sign({ user: username, type: 'api' }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRE
  });
  return {
    id_token,
    access_token
  };
};

const verify_pass_router = publicProcedure
  .input(
    z.object({
      username: z.string(),
      password: z.string()
    })
  )
  .output(
    z
      .object({
        verified: z.literal(false),
        err_code: get_zod_key_enum(dattStruct.drive.login.drive_auth_msgs)
      })
      .or(
        z.object({
          verified: z.literal(true),
          access_token: z.string(),
          id_token: z.string()
        })
      )
  )
  .query(async ({ input: { password, username } }) => {
    let verified = false;
    const user_info = await base_get<{ key: string; value: string }>(
      USERS_INFO_DRIVE_LOC,
      username
    );
    if (!user_info?.value) return { verified: false, err_code: 'user_not_found' };
    verified = await bcrypt.compare(password, user_info.value);
    if (!verified) return { verified, err_code: 'wrong_pass' };
    const { id_token, access_token } = get_id_and_aceess_token(username);
    return {
      verified,
      id_token,
      access_token
    };
  });

const id_token_payload_schema = z.object({
  user: z.string(),
  type: z.literal('login')
});
export const renew_access_token = publicProcedure
  .input(
    z.object({
      id_token: z.string()
    })
  )
  .output(
    z.union([
      z.object({
        verified: z.literal(false)
      }),
      z.object({
        verified: z.literal(true),
        access_token: z.string(),
        id_token: z.string()
      })
    ])
  )
  .query(async ({ input: { id_token } }) => {
    async function get_user_from_id_token() {
      let payload: z.infer<typeof id_token_payload_schema>;
      try {
        payload = id_token_payload_schema.parse(jwt.verify(id_token, JWT_SECRET));
        return payload;
      } catch {}
      return null;
    }
    const user = await get_user_from_id_token();
    if (!user)
      return {
        verified: false
      };
    return { verified: true, ...get_id_and_aceess_token(user.user) };
  });

const add_new_user_route = publicProcedure
  .input(
    z.object({
      username: z.string(),
      password: z.string(),
      email: z.string().email()
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      status_code: get_zod_key_enum(dattStruct.drive.login.new_user.msg_codes)
    })
  )
  .mutation(async ({ input: { username, password, email } }) => {
    let success = false;
    async function check_user_already_exist() {
      const data = await base_get<{ key: string; value: string }>(USERS_INFO_DRIVE_LOC, username);
      if (data?.value) return true;
      return false;
    }
    if (await check_user_already_exist()) return { success, status_code: 'user_already_exist' };

    // storing hashed_email
    const slt = gen_salt();
    const hashed_email = (await hash_256(email + slt)) + slt;
    base_put(`${USERS_INFO_DRIVE_LOC}_email`, [{ key: username, value: hashed_email }]);

    // storing hashed_password
    const hashed_password = await bcrypt.hash(password, await bcrypt.genSalt());
    base_put(USERS_INFO_DRIVE_LOC, [{ key: username, value: hashed_password }]);
    success = true;

    return { success, status_code: 'success_detail' };
  });

const reset_pass_route = publicProcedure
  .input(
    z.object({
      id: z.string(),
      email: z.string(),
      newPass: z.string()
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      status_code: get_zod_key_enum(dattStruct.drive.login.reset.msg_codes)
    })
  )
  .mutation(async ({ input: { id, email, newPass } }) => {
    let success = false;
    async function check_user_exist() {
      const data = await base_get<{ key: string; value: string }>(USERS_INFO_DRIVE_LOC, id);
      if (data?.value) return true;
      return false;
    }
    if (!(await check_user_exist())) return { success, status_code: 'user_not_found' };

    // verifying email
    const verified_email = await puShTi(
      email,
      (await base_get<{ key: string; value: string }>(`${USERS_INFO_DRIVE_LOC}_email`, id))?.value!
    );
    if (!verified_email) return { success, status_code: 'wrong_email' };

    // storing new password
    const hashed_password = await bcrypt.hash(newPass, await bcrypt.genSalt());
    base_put(USERS_INFO_DRIVE_LOC, [{ key: id, value: hashed_password }]);
    success = true;

    return { success, status_code: 'success_detail' };
  });

export const auth_router = t.router({
  verify_pass: verify_pass_router,
  renew_access_token: renew_access_token,
  add_new_user: add_new_user_route,
  reset_pass: reset_pass_route
});

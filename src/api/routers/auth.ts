import { publicProcedure, t } from '../trpc_init';
import { z } from 'zod';
import { JWT_SECRET } from '@tools/jwt.server';
import { SignJWT, jwtVerify } from 'jose';
import { base_get, base_put } from '@tools/deta';
import * as bcrypt from 'bcryptjs';
import { dattStruct } from '@langs/model';
import { get_zod_key_enum } from '@tools/zod_enum';
import { gen_salt, hash_256, puShTi } from '@tools/hash';
import * as crypto from 'crypto';

const ID_TOKREN_EXPIRE = '10days'; // so if not opened for 10 consecutive days will be logged out
const ACCESS_TOKEN_EXPIRE = '12hrs';

export const USERS_INFO_DRIVE_LOC = 'users_info';

const user_info_schema = z.object({
  key: z.string(),
  email_hash: z.string(),
  password: z.string(),
  encrypt_key: z.string().base64()
});
type user_info_type = z.infer<typeof user_info_schema>;

const get_id_and_aceess_token = async (username: string) => {
  const id_token = await new SignJWT({ user: username, type: 'login' })
    .setIssuedAt()
    .setProtectedHeader({
      alg: 'HS256'
    })
    .setExpirationTime(ID_TOKREN_EXPIRE)
    .sign(JWT_SECRET);
  const access_token = await new SignJWT({ user: username, type: 'api' })
    .setIssuedAt()
    .setProtectedHeader({
      alg: 'HS256'
    })
    .setExpirationTime(ACCESS_TOKEN_EXPIRE)
    .sign(JWT_SECRET);

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
    const user_info_parse = user_info_schema.safeParse(
      await base_get(USERS_INFO_DRIVE_LOC, username)
    );
    if (!user_info_parse.success) return { verified: false, err_code: 'user_not_found' };
    const user_info = user_info_parse.data;
    verified = await bcrypt.compare(password, user_info.password);
    if (!verified) return { verified, err_code: 'wrong_pass' };
    const { id_token, access_token } = await get_id_and_aceess_token(username);
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
        payload = id_token_payload_schema.parse((await jwtVerify(id_token, JWT_SECRET)).payload);
        return payload;
      } catch {}
      return null;
    }
    const user = await get_user_from_id_token();
    if (!user)
      return {
        verified: false
      };
    return { verified: true, ...(await get_id_and_aceess_token(user.user)) };
  });

async function check_user_already_exist(username: string) {
  const data_parse = user_info_schema.safeParse(await base_get(USERS_INFO_DRIVE_LOC, username));
  if (data_parse.success) return true;
  return false;
}

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
    if (await check_user_already_exist(username))
      return { success, status_code: 'user_already_exist' };

    // storing hashed_email
    const slt = gen_salt();
    const hashed_email = (await hash_256(email + slt)) + slt;

    // storing hashed_password
    const hashed_password = await bcrypt.hash(password, await bcrypt.genSalt());

    // encryption key :- a 32 byte random value
    const encrypt_key = crypto.randomBytes(32).toString('base64');

    await base_put(USERS_INFO_DRIVE_LOC, [
      {
        key: username,
        email_hash: hashed_email,
        password: hashed_password,
        encrypt_key
      }
    ]);

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
    const user_info_parse = user_info_schema.safeParse(await base_get(USERS_INFO_DRIVE_LOC, id));
    if (!user_info_parse.success) return { success, status_code: 'user_not_found' };
    const user_info = user_info_parse.data;

    // verifying email
    const verified_email = await puShTi(email, user_info.email_hash);
    (await base_get<{ key: string; value: string }>(`${USERS_INFO_DRIVE_LOC}_email`, id))?.value!;
    if (!verified_email) return { success, status_code: 'wrong_email' };

    // storing new password
    const hashed_password = await bcrypt.hash(newPass, await bcrypt.genSalt());
    base_put<user_info_type>(USERS_INFO_DRIVE_LOC, [{ ...user_info, password: hashed_password }]);
    success = true;

    return { success, status_code: 'success_detail' };
  });

export const auth_router = t.router({
  verify_pass: verify_pass_router,
  renew_access_token: renew_access_token,
  add_new_user: add_new_user_route,
  reset_pass: reset_pass_route
});

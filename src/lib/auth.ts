import { betterAuth } from 'better-auth';
import { pool } from '@/db/pool';
import * as argon2 from 'argon2';
import { nextCookies } from 'better-auth/next-js';
import { organization } from 'better-auth/plugins';
import { env } from '@/env';

export const auth = betterAuth({
  database: pool,

  advanced: {
    database: {
      generateId: 'uuid',
    },
  },

  user: {
    modelName: 'users',
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },

  session: {
    modelName: 'sessions',
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      userId: 'user_id',
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },

  account: {
    modelName: 'accounts',
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      password: 'password',
    },
  },

  verification: {
    modelName: 'verifications',
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,

    password: {
      hash: async (password) => {
        return await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 19456,
          timeCost: 2,
          parallelism: 1,
        });
      },

      verify: async ({ password, hash }) => {
        return await argon2.verify(hash, password);
      },
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(`$Verify email for ${user.email}: ${url}`);
    },
  },

  plugins: [
    organization({
      async sendInvitationEmail(data) {
        // Construct the invitation acceptance link
        const baseUrl = env.BETTER_AUTH_URL;
        const inviteLink = `${baseUrl}/accept-invitation/${data.id}`;

        // In production, use a proper email service (Resend, SendGrid, etc.)
        // For now, log to console for development
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 INVITATION EMAIL');
        console.log(`To: ${data.email}`);
        console.log(`From: ${data.inviter.user.name} (${data.inviter.user.email})`);
        console.log(`Organization: ${data.organization.name}`);
        console.log(`Role: ${data.role}`);
        console.log(`Accept Link: ${inviteLink}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      },
      schema: {
        organization: {
          modelName: 'organizations',
          fields: {
            createdAt: 'created_at',
          },
        },
        member: {
          modelName: 'members',
          fields: {
            userId: 'user_id',
            organizationId: 'organization_id',
            createdAt: 'created_at',
          },
        },
        invitation: {
          modelName: 'invitations',
          fields: {
            inviterId: 'inviter_id',
            organizationId: 'organization_id',
            createdAt: 'created_at',
            expiresAt: 'expires_at',
          },
        },
        session: {
          fields: {
            activeOrganizationId: 'active_organization_id',
          },
        },
      },
    }),
    nextCookies(),
  ],
});

export type Auth = typeof auth;

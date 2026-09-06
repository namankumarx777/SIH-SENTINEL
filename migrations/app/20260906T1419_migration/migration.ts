#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/25cd396b2a522b1740dc27f2ad642642b76cdb645e94cd964750589347e1447b/contract';
import endContract from '../../snapshots/25cd396b2a522b1740dc27f2ad642642b76cdb645e94cd964750589347e1447b/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/89dfaeb2070f4cf7a4b0e3472f38f6db7103fe37e7b33f028037ddf1bf07df86/contract';
import startContract from '../../snapshots/89dfaeb2070f4cf7a4b0e3472f38f6db7103fe37e7b33f028037ddf1bf07df86/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'invitation',
        columns: [
          col('acceptedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('createdById', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('organizationId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('token', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'invitation_role_check_57dbd473',
            "\"role\" IN ('ADMIN', 'INVESTIGATOR', 'REVIEWER', 'FORENSIC', 'AUDITOR')",
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'organization',
        column: col('status', 'text', {
          notNull: true,
          default: lit('ACTIVE'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('platformRole', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'invitation',
        constraint: 'invitation_token_key',
        columns: ['token'],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'organization',
        constraint: 'organization_status_check_1527ac15',
        expression: "\"status\" IN ('ACTIVE', 'SUSPENDED')",
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'user',
        constraint: 'user_platformRole_check_849b67c3',
        expression: '"platformRole" IN (\'PLATFORM_ADMIN\')',
      }),
      this.createIndex({
        schema: 'public',
        table: 'invitation',
        index: 'invitation_createdById_idx_8bf640ed',
        columns: ['createdById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'invitation',
        index: 'invitation_organizationId_email_idx_84e4a95f',
        columns: ['organizationId', 'email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'invitation',
        index: 'invitation_organizationId_idx_2e17ef41',
        columns: ['organizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'invitation',
        index: 'invitation_token_idx_8b25281e',
        columns: ['token'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'invitation',
        foreignKey: {
          name: 'invitation_organizationId_fkey',
          columns: ['organizationId'],
          references: { schema: 'public', table: 'organization', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'invitation',
        foreignKey: {
          name: 'invitation_createdById_fkey',
          columns: ['createdById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'invitation' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

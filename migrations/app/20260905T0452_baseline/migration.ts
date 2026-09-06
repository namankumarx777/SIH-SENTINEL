#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/89dfaeb2070f4cf7a4b0e3472f38f6db7103fe37e7b33f028037ddf1bf07df86/contract';
import endContract from '../../snapshots/89dfaeb2070f4cf7a4b0e3472f38f6db7103fe37e7b33f028037ddf1bf07df86/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'auditLog',
        columns: [
          col('action', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('actorId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('caseId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('documentId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('meta', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('organizationId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('resource', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('result', 'text', {
            notNull: true,
            default: lit('SUCCESS'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'auditLog_result_check_1455f3c8',
            "\"result\" IN ('SUCCESS', 'INFO', 'WARNING', 'FAILURE')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'case',
        columns: [
          col('caseNumber', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('classification', 'text', {
            notNull: true,
            default: lit('CONFIDENTIAL'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('jurisdiction', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('organizationId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'case_classification_check_70411d25',
            "\"classification\" IN ('RESTRICTED', 'CONFIDENTIAL', 'INTERNAL', 'PUBLIC')",
          ),
          checkExpression(
            'case_status_check_b3fb7583',
            "\"status\" IN ('ACTIVE', 'UNDER_REVIEW', 'CLOSED', 'ARCHIVED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'caseMember',
        columns: [
          col('caseId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('isLead', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'document',
        columns: [
          col('caseId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('classification', 'text', {
            notNull: true,
            default: lit('CONFIDENTIAL'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('integrity', 'text', {
            notNull: true,
            default: lit('VERIFIED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('VERIFIED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('tags', 'text[]', { notNull: true, codecRef: { codecId: 'pg/text@1', many: true } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'document_classification_check_70411d25',
            "\"classification\" IN ('RESTRICTED', 'CONFIDENTIAL', 'INTERNAL', 'PUBLIC')",
          ),
          checkExpression(
            'document_integrity_check_199fc3cf',
            "\"integrity\" IN ('VERIFIED', 'PENDING', 'MISMATCH', 'REVOKED')",
          ),
          checkExpression(
            'document_status_check_9291dd6b',
            "\"status\" IN ('VERIFIED', 'REVIEW', 'DRAFT', 'REJECTED')",
          ),
          checkExpression(
            'document_tags_elem_not_null_aecbe9e2',
            'array_position("tags", NULL) IS NULL',
          ),
          checkExpression(
            'document_type_check_9868eec6',
            "\"type\" IN ('FIR', 'STATEMENT', 'FORENSIC', 'LEGAL', 'EVIDENCE', 'REPORT', 'FILING')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'documentVersion',
        columns: [
          col('approvedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('approverId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('current', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('documentId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('size', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('storagePath', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('uploadedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('uploadedById', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('version', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'organization',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'organizationMember',
        columns: [
          col('badge', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('department', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('initials', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('organizationId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'organizationMember_role_check_57dbd473',
            "\"role\" IN ('ADMIN', 'INVESTIGATOR', 'REVIEWER', 'FORENSIC', 'AUDITOR')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'share',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('documentId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('expiration', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('justification', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('permission', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('recipient', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sharedById', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('authId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'case',
        constraint: 'case_organizationId_caseNumber_key',
        columns: ['organizationId', 'caseNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'caseMember',
        constraint: 'caseMember_caseId_userId_key',
        columns: ['caseId', 'userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'organizationMember',
        constraint: 'organizationMember_organizationId_userId_key',
        columns: ['organizationId', 'userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_authId_key',
        columns: ['authId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_actorId_idx_a58f6b4b',
        columns: ['actorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_caseId_idx_f7093793',
        columns: ['caseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_documentId_idx_825ef746',
        columns: ['documentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_organizationId_idx_2e17ef41',
        columns: ['organizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'case',
        index: 'case_organizationId_idx_2e17ef41',
        columns: ['organizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'caseMember',
        index: 'caseMember_caseId_idx_f7093793',
        columns: ['caseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'caseMember',
        index: 'caseMember_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'document',
        index: 'document_caseId_idx_f7093793',
        columns: ['caseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'documentVersion',
        index: 'documentVersion_approverId_idx_a4f46e61',
        columns: ['approverId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'documentVersion',
        index: 'documentVersion_documentId_idx_825ef746',
        columns: ['documentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'documentVersion',
        index: 'documentVersion_uploadedById_idx_b92fad21',
        columns: ['uploadedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'organizationMember',
        index: 'organizationMember_organizationId_idx_2e17ef41',
        columns: ['organizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'organizationMember',
        index: 'organizationMember_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'share',
        index: 'share_documentId_idx_825ef746',
        columns: ['documentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'share',
        index: 'share_sharedById_idx_d164d715',
        columns: ['sharedById'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auditLog',
        foreignKey: {
          name: 'auditLog_organizationId_fkey',
          columns: ['organizationId'],
          references: { schema: 'public', table: 'organization', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auditLog',
        foreignKey: {
          name: 'auditLog_caseId_fkey',
          columns: ['caseId'],
          references: { schema: 'public', table: 'case', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auditLog',
        foreignKey: {
          name: 'auditLog_documentId_fkey',
          columns: ['documentId'],
          references: { schema: 'public', table: 'document', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auditLog',
        foreignKey: {
          name: 'auditLog_actorId_fkey',
          columns: ['actorId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'case',
        foreignKey: {
          name: 'case_organizationId_fkey',
          columns: ['organizationId'],
          references: { schema: 'public', table: 'organization', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'caseMember',
        foreignKey: {
          name: 'caseMember_caseId_fkey',
          columns: ['caseId'],
          references: { schema: 'public', table: 'case', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'caseMember',
        foreignKey: {
          name: 'caseMember_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'document',
        foreignKey: {
          name: 'document_caseId_fkey',
          columns: ['caseId'],
          references: { schema: 'public', table: 'case', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'documentVersion',
        foreignKey: {
          name: 'documentVersion_documentId_fkey',
          columns: ['documentId'],
          references: { schema: 'public', table: 'document', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'documentVersion',
        foreignKey: {
          name: 'documentVersion_uploadedById_fkey',
          columns: ['uploadedById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'documentVersion',
        foreignKey: {
          name: 'documentVersion_approverId_fkey',
          columns: ['approverId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'organizationMember',
        foreignKey: {
          name: 'organizationMember_organizationId_fkey',
          columns: ['organizationId'],
          references: { schema: 'public', table: 'organization', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'organizationMember',
        foreignKey: {
          name: 'organizationMember_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'share',
        foreignKey: {
          name: 'share_documentId_fkey',
          columns: ['documentId'],
          references: { schema: 'public', table: 'document', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'share',
        foreignKey: {
          name: 'share_sharedById_fkey',
          columns: ['sharedById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'auditLog' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'case' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'caseMember' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'document' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'documentVersion' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'organization' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'organizationMember' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'share' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'user' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

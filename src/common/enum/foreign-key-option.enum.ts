export enum OnDeleteForeignKeyOptionEnum {
  /**
   * CASCADE: Automatically deletes rows in the child table that reference rows in the parent table
   * when the corresponding row in the parent table is deleted.
   */
  CASCADE = 'CASCADE',

  /**
   * DEFERRABLE: Allows the constraint check to be deferred until the end of the transaction.
   * This means the action is delayed and not immediately enforced.
   */
  DEFERRABLE = 'DEFERRABLE',

  /**
   * NO_ACTION: No action is taken when a row in the parent table is deleted, but it may cause
   * an error if there are still child rows referencing the parent.
   */
  NO_ACTION = 'NO ACTION',

  /**
   * NOT_DEFERRABLE: Specifies that the foreign key constraint cannot be deferred and must be checked
   * immediately at the time of the operation.
   */
  NOT_DEFERRABLE = 'NOT DEFERRABLE',

  /**
   * NULLIFY: Sets the foreign key reference to `NULL` when the referenced row in the parent table is deleted.
   * It is similar to `SET NULL`.
   */
  NULLIFY = 'NULLIFY',

  /**
   * RESTRICT: Prevents the deletion of a row in the parent table if there are any rows in the child table
   * that reference it.
   */
  RESTRICT = 'RESTRICT',

  /**
   * SET_DEFAULT: Sets the foreign key column in the child table to its default value when the corresponding
   * row in the parent table is deleted.
   */
  SET_DEFAULT = 'SET DEFAULT',

  /**
   * SET_NULL: Sets the foreign key column to `NULL` in the child table when the corresponding row in the parent
   * table is deleted.
   */
  SET_NULL = 'SET NULL',
}

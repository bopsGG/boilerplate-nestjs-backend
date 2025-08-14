import { Brackets, WhereExpressionBuilder } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';

function isStringColumn(col: ColumnMetadata): boolean {
  const validTypes = ['varchar', 'text', 'nvarchar', 'longtext'];

  return (
    col.type === String ||
    validTypes.includes(col.type as string) ||
    col.type === String.name
  );
}

function isEnumColumn(col: ColumnMetadata): boolean {
  return !!col.enum;
}

function isColumnSelected(
  col: ColumnMetadata,
  selectColumns: string[],
): boolean {
  return selectColumns.length === 0 || selectColumns.includes(col.propertyName);
}

function getValidColumns(
  columns: ColumnMetadata[],
  selectColumns: string[],
): ColumnMetadata[] {
  return columns.filter(
    (col) =>
      isStringColumn(col) &&
      !isEnumColumn(col) &&
      isColumnSelected(col, selectColumns),
  );
}

function addInnerSearchConditions(
  innerQb: WhereExpressionBuilder,
  alias: string,
  columns: ColumnMetadata[],
  searchKeyword: string,
  selectColumns: string[] = [],
): WhereExpressionBuilder {
  const validColumns = getValidColumns(columns, selectColumns);

  if (validColumns.length === 0) return innerQb;

  innerQb.andWhere(
    new Brackets((qb) => {
      validColumns.forEach((col, idx) => {
        const condition = `${alias}.${col.propertyName} LIKE :keyword`;
        const params = { keyword: `%${searchKeyword}%` };
        if (idx === 0) {
          qb.where(condition, params);
        } else {
          qb.orWhere(condition, params);
        }
      });
    }),
  );

  return innerQb;
}

export function addSearchConditions(
  outerQb: WhereExpressionBuilder,
  alias: string,
  columns: ColumnMetadata[],
  searchKeyword: string,
  selectColumns: string[] = [],
): WhereExpressionBuilder {
  return outerQb.orWhere(
    new Brackets((innerQb) => {
      addInnerSearchConditions(
        innerQb,
        alias,
        columns,
        searchKeyword,
        selectColumns,
      );
    }),
  );
}

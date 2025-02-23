import { CSTableFilterPredicates } from "@ngx-codinus/material/table";

export const NumberFilterPredicates: CSTableFilterPredicates<number | bigint> = {
    'equals': (a, b) => a == b,
    'notEquals': (a, b) => a != b,
    'greaterThan': (a, b) => a > b,
    'greaterThanOrEqual': (a, b) => a >= b,
    'lesserThan': (a, b) => a < b,
    'lesserThanOrEqual': (a, b) => a <= b,
};

export const StringFilterPredicates: CSTableFilterPredicates<string> = {
    'contains': (a, b) => a.includes(b),
    'equals': (a, b) => a.localeCompare(b) === 0,
    'notEquals': (a, b) => a.localeCompare(b) !== 0,
    'startsWith': (a, b) => a.startsWith(b),
    'endsWith': (a, b) => a.endsWith(b)
};

export const DateFilterPredicates: CSTableFilterPredicates<Date> = {
    'equals': (a, b) => a?.valueOf() == b?.valueOf(),
    'notEquals': (a, b) => a?.valueOf() != b?.valueOf(),
    'greaterThan': (a, b) => a?.valueOf() > b?.valueOf(),
    'greaterThanOrEqual': (a, b) => a?.valueOf() >= b?.valueOf(),
    'lesserThan': (a, b) => a?.valueOf() < b?.valueOf(),
    'lesserThanOrEqual': (a, b) => a?.valueOf() <= b?.valueOf(),
};
import _ from "lodash";

export function includesEqual(array, item) {
  return !!_.find(array, x => _.isEqual(x, item));
}

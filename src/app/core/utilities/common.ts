import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';
export class CommonUtility {
  static datatable: any = null;

  static delay = (ms: any) => new Promise((res) => setTimeout(res, ms));

  static flatten(array: any) {
    var result: any = [];
    array.forEach((a: any) => {
      result.push(a);
      if (Array.isArray(a.subMenus)) {
        result = result.concat(this.flatten(a.subMenus));
      }
    });
    return result;
  }

  static isNull(item: any): boolean {
    return item === undefined || item === null;
  }

  static isEmpty(item: any): boolean {
    return (
      item === undefined ||
      item === null ||
      item.length === 0 ||
      item === 0 ||
      item === '' ||
      item === 'null'
    );
  }

  static isNotNull(item: any): boolean {
    return item !== undefined && item !== null;
  }

  static isNotEmpty(item: any): boolean {
    return item !== undefined && item !== null && item.length !== 0;
  }

  static isObjectEmpty(obj: any): boolean {
    return (
      CommonUtility.isNull(obj) ||
      Object.keys(obj).length === 0 ||
      !Object.keys(obj).some((k) => CommonUtility.isNotEmpty(obj[k]))
    );
  }

  static splitKeys(keys: string, separator: string = ','): string[] {
    return keys.split(separator);
  }

  static convertObjectToParams(paramObj: any) {
    let params: any = new URLSearchParams();
    for (let key in paramObj || {}) {
      if (
        paramObj.hasOwnProperty(key) &&
        CommonUtility.isNotEmpty(paramObj[key]) &&
        typeof paramObj[key] !== 'object'
      ) {
        params.set(key, paramObj[key]);
      } else if (Array.isArray(paramObj[key])) {
        paramObj[key].forEach((k: any) => {
          params.append(key, k);
        });
      }
    }
    return params;
  }

  // convert array to url search params
  static convertArrayToParams(paramArray: any[]) {
    let params = new HttpParams();
    paramArray.forEach((element) => {
      params = params.append(element.key, element.value);
    });
    return params;
  }

  static convertObjectToUrlEncoded(paramObj: any) {
    let params = new HttpParams();
    for (let key in paramObj) {
      if (paramObj.hasOwnProperty(key) && paramObj[key]) {
        params = params.append(key, paramObj[key]);
      }
    }
    return params;
  }

  static convertToUrlParams = (object: any) => {
    var parameters = [];
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        parameters.push(encodeURI(property + '=' + object[property]));
      }
    }

    return parameters.join('&');
  };

  static getParameter(paramName: any) {
    var searchString = window.location.search.substring(1),
      i,
      val,
      params = searchString.split('&');

    for (i = 0; i < params.length; i++) {
      val = params[i].split('=');
      if (val[0] == paramName) {
        return val[1];
      }
    }
    return null;
  }

  static convertObjectStringToNumber(obj: any) {
    const res: any = {};
    for (const prop in obj) {
      const parsed = parseInt(obj[prop], 10);
      res[prop] = isNaN(parsed) ? obj[prop] : parsed;
    }
    return res;
  }

  static isNumber(n: any): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  static dateformat(
    dateString: string,
    format: string = 'YYYY-MM-DD'
  ): string | null {
    if (!dateString) return null;

    const m = moment.utc(dateString);
    return m.isValid() ? m.local().format(format) : null;
  }

  static dateformatDistributorMargin(
    dateString: string,
    format: string = 'YYYY-DD-MM'
  ) {
    return moment.utc(dateString).local().format(format);
  }

  static camelize(str: string) {
    if (!str) {
      return '';
    }
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  static sortTableData(field: string, sortDirection: any, data: any) {
    data.sort((a: any, b: any) => {
      let aValue;
      let bValue;
      if (field.includes('.')) {
        const splitVal1 = field.split('.')[0];
        const splitVal2 = field.split('.')[1];
        const splitVal3 = field.split('.')[2];
        if (splitVal3) {
          aValue = a[splitVal1][splitVal2][splitVal3];
          bValue = b[splitVal1][splitVal2][splitVal3];
        } else {
          aValue = a[splitVal1][splitVal2];
          bValue = b[splitVal1][splitVal2];
        }
      } else {
        aValue = a[field];
        bValue = b[field];
      }
      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }
}

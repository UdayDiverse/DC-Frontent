// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// For LG Server

// export const environment = {
//   production: false,
//   apiPath: '',
//   commonAPI: 'http://10.101.0.225:8086/',
//   dcURL: 'http://10.101.0.225:9097/',
//   dcAPIURL: 'http://10.101.0.225:8080/api/v1/',
//   umsURL: 'http://10.101.0.225:3252',
//   umsAPIURL: 'http://10.101.0.225:8087/api/',
// };

// For DIPL Server

export const environment = {
  production: false,
  apiPath: '',
  commonAPI: 'http://111.93.61.251:8086/',
  dcURL: 'http://111.93.61.253:9097/',
  dcAPIURL: 'http://111.93.61.253:8091/api/v1/',
  umsURL: 'http://111.93.61.253:3252',
  umsAPIURL: 'http://111.93.61.253:8087/api/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

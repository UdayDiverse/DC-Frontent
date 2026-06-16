import { Injectable } from "@angular/core";
import * as XLSX from 'xlsx';
import { CommonUtility } from "../utilities/common";

@Injectable({
    providedIn: "root",
})
export class XlsxService {

    constructor() {
    }

    xlsImport(e: any) {
        var data = e.target.result;
        data = new Uint8Array(data);
        
        var workbook = XLSX.read(data, { type: 'array' });
        var result: any = [];
        workbook.SheetNames.forEach((sheetName)=> {
            var roa:any = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
            //if (roa.length) result[sheetName] = roa;
            const headers:any = roa[0];
            for(var i=1;i<=roa.length;i++){

                const obj:any = {};
                if(roa[i]){

                    for(var j=0;j<=roa[i].length;j++){
                        if(roa[0][j]){
                            obj[CommonUtility.camelize(roa[0][j])] = roa[i][j];
                        }
                    }
                }
                if(Object.keys(obj).length === 0 && obj.constructor === Object){

                }else{
                    result.push(obj);
                }
                
            }
        });
        // see the result, caution: it works after reader event is done.
        console.log(result);
        return result;
    }
    xlsxExport(rows: any[] = [], heading: any[] = [], fileName: string = 'Download Template') {
        const wb = XLSX.utils.book_new();

        const Heading = [
            heading
        ];

        // creating sheet and adding data from 2nd row of column A.
        // leaving first row to add Heading
        const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });

        // adding heading to the first row of the created sheet.
        // sheet already have contents from above statement.
        XLSX.utils.sheet_add_aoa(ws, Heading, { origin: 'A1' });

        // appending sheet with a name
        XLSX.utils.book_append_sheet(wb, ws, `Sheet`);

        XLSX.writeFile(wb, `${fileName}.csv`);
    }
}

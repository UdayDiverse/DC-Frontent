import { Injectable } from "@angular/core";
import { ExportAsConfig, ExportAsService } from "ngx-export-as";

@Injectable({
    providedIn: "root",
})
export class ExportService {
    exportAsConfig: ExportAsConfig = {
        type: 'csv', // the file type to download
        elementIdOrContent: 'exportableTable', // the id of html/table element
    }

    constructor(private exportAsService: ExportAsService) {
    }

    csvExport(fileName: string) {
        this.exportAsService.save(this.exportAsConfig, fileName).subscribe(() => {
        });
    }
}

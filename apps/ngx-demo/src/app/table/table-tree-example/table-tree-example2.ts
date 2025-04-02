// import { Component, OnInit } from '@angular/core';
// import { CodinusTableModule } from '@ngx-codinus/material/table';

// export interface ReportCard {
//     student: string;
//     reports: Report[];
// }

// export interface Report {
//     class: string;
//     teacher: string;
//     grade: string;
// }

// const REPORT_DATA: ReportCard[] = [
//     {
//         student: 'Harry Potter',
//         reports: [
//             {
//                 class: 'Defense Against the Dark Arts',
//                 teacher: 'Remus Lupin',
//                 grade: 'B-',
//             },
//             {
//                 class: 'Potions',
//                 teacher: 'Severus Snape',
//                 grade: 'C+',
//             },
//         ],
//     },
//     {
//         student: 'Hermione Granger',
//         reports: [
//             {
//                 class: 'Defense Against the Dark Arts',
//                 teacher: 'Remus Lupin',
//                 grade: 'A+',
//             },
//             {
//                 class: 'Potions',
//                 teacher: 'Severus Snape',
//                 grade: 'A+',
//             },
//             {
//                 class: 'Time Travel',
//                 teacher: 'Minerva McGonagall',
//                 grade: 'A+',
//             },
//         ],
//     },
//     {
//         student: 'Draco Malfoy',
//         reports: [
//             {
//                 class: 'Dark Arts',
//                 teacher: 'Lord Voldemort',
//                 grade: 'A+',
//             },
//         ],
//     },
// ];

// @Component({
//     selector: 'table-tree-example',
//     templateUrl: './table-tree-example.html',
//     imports: [CodinusTableModule]
// })
// export class TableTreeExample implements OnInit {

//     private reportCards = REPORT_DATA;

//     public reportCardColumns: string[] = ['reportCard.student', 'report.class', 'report.grade', 'report.teacher'];
//     public reportColumns: string[] = ['report.class', 'report.grade', 'report.teacher'];
//     public reportCardHeaderColumns: string[] = ['reportCard.student', 'reportCard.classes'];
//     public reportHeaderColumns: string[] = ['report.class', 'report.grade', 'report.teacher'];
//     public dataSource!: Array<ReportCard | Report>;


//     public ngOnInit(): void {
//         const data: Array<ReportCard | Report> = [];
//         for (const reportCard of REPORT_DATA) {
//             data.push(reportCard, ...reportCard.reports.slice(1));
//         }
//         this.dataSource = data;
//     }

//     public isReportCard(index: number, data: ReportCard | Report): boolean {
//         return Reflect.has(data, 'reports');
//     }

//     public isReport(index: number, data: ReportCard | Report): boolean {
//         return !Reflect.has(data, 'reports');
//     }
// }


import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CSTableTreeDataSource, CSTreeNodeItem } from '@ngx-codinus/material/table';

export interface PeriodicElement {
    name: string;
    key: number;
    weight: number;
    symbol: string;
    parentKey?: null | number;
}

const ELEMENT_DATA: PeriodicElement[] = [
    { key: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', parentKey: null },
    { key: 2, name: 'Helium', weight: 4.0026, symbol: 'He', parentKey: 3 },
    { key: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', parentKey: 4 },
    { key: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be', parentKey: null },
    { key: 5, name: 'Boron', weight: 10.811, symbol: 'B', parentKey: 4 },
    { key: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', parentKey: null },
    { key: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', parentKey: null },
    { key: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', parentKey: 1 },
    { key: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F', parentKey: 1 },
    { key: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', parentKey: null },
];

/**
 * @title Basic use of `<mat-table>` (uses display flex)
 */
@Component({
    selector: 'table-flex-basic-example',
    styleUrl: './table-tree-example2.scss',
    templateUrl: './table-tree-example2.html',
    imports: [MatTableModule, MatIconModule, MatButtonModule],
})
export class TableTreeExample2 {
    displayedColumns: string[] = ['key', 'name', 'weight', 'symbol'];
    childDisplayedColumns: string[] = ['child.key', 'child.name', 'child.weight', 'child.symbol'];

    constructor() {
        //const ds = new CSTableTreeDataSource<PeriodicElement, number>(i => i.key, i => i.parentKey, ELEMENT_DATA);
        this.dataSource.keyGetter = i => i.key;
        this.dataSource.parentKeyGetter = i => i.parentKey;
    }

    dataSource = new CSTableTreeDataSource<PeriodicElement, number>(ELEMENT_DATA);

    onClick(node: CSTreeNodeItem<PeriodicElement>) {
        this.dataSource.toggleNode(node);
    }

}

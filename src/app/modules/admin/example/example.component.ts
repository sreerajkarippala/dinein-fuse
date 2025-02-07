import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import ApexCharts from 'apexcharts';
import {
    overView,
    overView2,
    overView3,
} from 'app/mock-api/common/overview/data';
import { RestaurantService } from 'app/service/restaurant/restaurant.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';


@Component({
    selector: 'example',
    standalone: true,
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatTableModule,
        MatSortModule,
        MatGridListModule,
        MatCardModule,
        MatButtonModule,
        CommonModule,
        MatListModule,
        MatMenuModule,
        MatIconModule,
    ],
})
export class ExampleComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
    columns: string[] = ['name', 'email', 'dishes', 'tableNumber', 'date'];
    overViewData = overView;
    dataSource = this.overViewData;
    dishesCount: { [key: string]: number } = {};
    slowMovingDishes: { name: string; count: number }[] = [];
    chart: ApexCharts;
    resizeObserver: ResizeObserver;
    selectedRestaurant: string = 'Restaurant 1';
    icon: 'heroicons_outline:bars-3';

    constructor(private _restaurantService: RestaurantService) {}

    ngOnInit(): void {
        this.calculateOrderNumber();
        console.log(this.dishesCount);
        this._restaurantService.selectedRestaurant$.subscribe((restaurant) => {
            this.selectedRestaurant = restaurant;
            console.log('Selected restaurant:', this.selectedRestaurant);
            this.updateRestaurantData();
        });
    }

    ngAfterViewInit(): void {
        this.initializeChart();
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    calculateOrderNumber() {
        this.dishesCount = {};
        this.overViewData.forEach((entry) => {
            entry.dishes.forEach((dish) => {
                if (this.dishesCount[dish]) {
                    this.dishesCount[dish]++;
                } else {
                    this.dishesCount[dish] = 1;
                }
            });
        });

        const dishesArray = Object.keys(this.dishesCount).map((dishName) => ({
            name: dishName,
            count: this.dishesCount[dishName],
        }));

        dishesArray.sort((a, b) => a.count - b.count);

        this.slowMovingDishes = dishesArray.slice(0, 6);
    }

    initializeChart() {
        this.resizeObserver = new ResizeObserver(() => {
            if (this.chart) {
                this.chart.destroy();
            }
            this.renderChart();
        });

        this.resizeObserver.observe(this.chartContainer.nativeElement);
    }

    renderChart() {
        const sortedDishes = Object.entries(this.dishesCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const categories = sortedDishes.map((item) => item[0]);
        const values = sortedDishes.map((item) => item[1]);

        var options = {
            series: [{ data: values }],
            chart: {
                type: 'bar',
                height: 350,
                width: '100%',
                foreColor: '#000000',
            },
            colors: ['#333333'],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    borderRadiusApplication: 'end',
                    horizontal: true,
                },
            },
            dataLabels: { enabled: false },
            xaxis: { categories: categories },

            title: {
                text: 'Top Moving Dishes',
                align: 'left',
                offsetX: 12,
                offsetY: 14,
                floating: false,
                style: {
                    fontWeight: '750',
                    fontSize: '14px',
                    color: '#333',
                    padding: '10px',
                },
            },

            annotations: {
                position: 'top',
                xaxis: [
                    {
                        x: 0,
                        strokeDashArray: 2,
                        borderColor: '#ddd',
                        borderWidth: 2,
                    },
                ],
            },
        };

        this.chart = new ApexCharts(this.chartContainer.nativeElement, options);
        this.chart.render();
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    }

    updateRestaurantData() {
        console.log('dataSource Before: ', this.dataSource);
        console.log('OverViewData before :', this.overViewData);
        if (this.selectedRestaurant === 'Restaurant 1') {
            this.overViewData = overView;
        } else if (this.selectedRestaurant === 'Restaurant 2') {
            this.overViewData = overView2;
        } else if (this.selectedRestaurant === 'Restaurant 3') {
            this.overViewData = overView3;
        }

        this.dataSource = this.overViewData;
        console.log('dataSource After: ', this.dataSource);
        console.log('OverViewData After :', this.overViewData);
        this.calculateOrderNumber();
        this.initializeChart();
    }

    exportToCSV() {
        const csvData = this.dataSource.map((row) => ({
            Name: row.user.name,
            Email: row.user.email,
            Dishes: row.dishes.join(', '),
            TableNumber: row.tableNumber,
            Date: row.date,
        }));
        const csvString = this.convertToCSV(csvData);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'TableData.csv');
    }

    convertToCSV(data: any[]) {
        const headers = Object.keys(data[0]).join(',') + '\n';
        const rows = data.map((obj) => Object.values(obj).join(',')).join('\n');
        return headers + rows;
    }
    exportToExcel() {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
            this.dataSource.map((row) => ({
                Name: row.user.name,
                Email: row.user.email,
                Dishes: row.dishes.join(', '),
                TableNumber: row.tableNumber,
                Date: row.date,
            }))
        );

        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Table Data');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
            type: 'application/octet-stream',
        });
        saveAs(blob, 'TableData.xlsx');
    }
}

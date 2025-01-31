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
import { overView as overViewData } from 'app/mock-api/common/overview/data';

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
    ],
})
export class ExampleComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
    columns: string[] = ['name', 'email', 'dishes', 'tableNumber', 'date'];
    dataSource = overViewData;
    dishesCount: { [key: string]: number } = {};
    slowMovingDishes: { name: string; count: number }[] = [];
    chart: ApexCharts;
    resizeObserver: ResizeObserver;

    ngOnInit(): void {
        this.calculateOrderNumber();
        console.log(this.dishesCount);
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
        overViewData.forEach((entry) => {
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
            },
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
}

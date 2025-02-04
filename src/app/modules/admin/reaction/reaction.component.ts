import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTable, MatTableModule } from '@angular/material/table';
import ApexCharts from 'apexcharts';
import {
    comment,
    comment2,
    comment3,
} from 'app/mock-api/common/Reaction/comment/data';
import { like, like2, like3 } from 'app/mock-api/common/Reaction/like/data';
import { open, open2, open3 } from 'app/mock-api/common/Reaction/open/data';
import { view, view2, view3 } from 'app/mock-api/common/Reaction/view/data';
import { RestaurantService } from 'app/service/restaurant/restaurant.service';
interface DishStats {
    dish: string;
    likes: number;
    views: number;
    opens: number;
}
@Component({
    selector: 'app-reaction',
    standalone: true,
    imports: [
        MatCardModule,
        MatTable,
        MatTableModule,
        MatButtonToggleModule,
        FormsModule,
        CommonModule,
    ],
    templateUrl: './reaction.component.html',
    styleUrl: './reaction.component.scss',
})
export class ReactionComponent implements OnInit {
    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
    @ViewChild('viewChartContainer', { static: true })
    viewChartContainer: ElementRef;
    @ViewChild('openChartContainer', { static: true })
    openChartContainer: ElementRef;
    columnsLike: string[] = ['email', 'dish', 'date'];
    columnsView: string[] = ['email', 'dish', 'date'];
    columnsOpen: string[] = ['email', 'dish', 'date'];
    columnsComment: string[] = ['email', 'comment', 'date'];
    likeData = like;
    viewData = view;
    openData = open;
    commentData = comment;
    chart: ApexCharts;
    viewChart: ApexCharts;
    openChart: ApexCharts;
    resizeObserver: ResizeObserver;
    dishStats: DishStats[] = [];
    selectedTable: string = 'likes';
    selectedRestaurant: string = 'Restaurant 1';

    constructor(private _restaurantService: RestaurantService) {}

    onTableChange(selectedValue: string) {
        this.selectedTable = selectedValue;
        console.log('Selected Table:', this.selectedTable);
    }
    ngOnInit(): void {
        console.log(this.likeData);
        console.log(this.viewData);
        console.log(this.openData);
        console.log(this.commentData);
        this.dishStats = this.getDishStats(
            this.likeData,
            this.viewData,
            this.openData
        );
        console.log(this.dishStats);
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

    initializeChart() {
        this.resizeObserver = new ResizeObserver(() => {
            if (this.chart) {
                this.chart.destroy();
            }
            if (this.viewChart) {
                this.viewChart.destroy();
            }
            if (this.openChart) {
                this.openChart.destroy();
            }

            this.renderChart();
            this.renderViewChart();
            this.renderOpenChart();
        });

        this.resizeObserver.observe(this.chartContainer.nativeElement);
        this.resizeObserver.observe(this.viewChartContainer.nativeElement);
        this.resizeObserver.observe(this.openChartContainer.nativeElement);
    }

    getDishStats(
        likesData: { email: string; dish: string; date: string }[],
        viewData: { email: string; dish: string; date: string }[],
        openData: { email: string; dish: string; date: string }[]
    ): DishStats[] {
        const statsMap: Map<string, DishStats> = new Map();

        function updateCount(data: { dish: string }[], key: keyof DishStats) {
            data.forEach(({ dish }) => {
                if (!statsMap.has(dish)) {
                    statsMap.set(dish, { dish, likes: 0, views: 0, opens: 0 });
                }
                statsMap.get(dish)![key]++;
            });
        }

        updateCount(likesData, 'likes');
        updateCount(viewData, 'views');
        updateCount(openData, 'opens');

        return Array.from(statsMap.values());
    }

    renderChart() {
        this.dishStats.sort((a, b) => b.likes - a.likes);
        const top10Dishes = this.dishStats.slice(0, 10);
        const categories = top10Dishes.map((item) => item.dish);
        const values = top10Dishes.map((item) => item.likes);

        console.log('Categories:', categories);
        console.log('Values:', values);

        var options = {
            series: [
                {
                    data: values,
                },
            ],
            chart: {
                type: 'bar',
                height: 350,
                width: '100%',
            },
            colors: ['#333333'],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    borderRadiusApplication: 'end',
                    horizontal: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            xaxis: {
                categories: categories,
            },
            title: {
                text: 'Likes for Dishes',
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

    renderViewChart() {
        this.dishStats.sort((a, b) => b.views - a.views);
        const top10Dishes = this.dishStats.slice(0, 10);
        const categories = top10Dishes.map((item) => item.dish);
        const values = top10Dishes.map((item) => item.views);

        var options = {
            series: [
                {
                    data: values,
                },
            ],
            chart: {
                type: 'bar',
                height: '100%',
                width: '100%',
            },
            colors: ['#333333'],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    borderRadiusApplication: 'end',
                    horizontal: true,
                },
            },
            dataLabels: {
                enabled: false,
            },
            xaxis: {
                categories: categories,
            },
            title: {
                text: 'Views for Dishes',
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

        this.viewChart = new ApexCharts(
            this.viewChartContainer.nativeElement,
            options
        );
        this.viewChart.render();
    }

    renderOpenChart() {
        this.dishStats.sort((a, b) => b.opens - a.opens);
        const categories = this.dishStats.slice(0, 10).map((item) => item.dish);
        const values = this.dishStats.slice(0, 10).map((item) => item.opens);

        var options = {
            series: values,
            chart: {
                type: 'donut',
                height: '100%',
                width: '100%',
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '50%',
                        background: 'transparent',
                        stroke: {
                            width: 60,
                            color: '#fff',
                        },
                    },
                },
            },
            labels: categories,
            dataLabels: {
                enabled: true,
            },
            title: {
                text: 'Opens for Dishes',
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

        console.log('Donut Chart Options:', options);

        this.openChart = new ApexCharts(
            this.openChartContainer.nativeElement,
            options
        );
        this.openChart.render();
    }
    updateRestaurantData() {
        // Update the data based on the selected restaurant
        if (this.selectedRestaurant === 'Restaurant 1') {
            this.likeData = like;
            this.viewData = view;
            this.openData = open;
            this.commentData = comment;
        } else if (this.selectedRestaurant === 'Restaurant 2') {
            this.likeData = like2;
            this.viewData = view2;
            this.openData = open2;
            this.commentData = comment2;
        } else if (this.selectedRestaurant === 'Restaurant 3') {
            this.likeData = like3;
            this.viewData = view3;
            this.openData = open3;
            this.commentData = comment3;
        }

        // Update the dish stats with the new data
        this.dishStats = this.getDishStats(
            this.likeData,
            this.viewData,
            this.openData
        );

        if (this.chart) {
            this.chart.destroy();
        }
        if (this.viewChart) {
            this.viewChart.destroy();
        }
        if (this.openChart) {
            this.openChart.destroy();
        }

        this.renderChart();
        this.renderViewChart();
        this.renderOpenChart();
    }
}


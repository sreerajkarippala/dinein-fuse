import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTable, MatTableModule } from '@angular/material/table';
import ApexCharts from 'apexcharts';
import { comment as commentData } from 'app/mock-api/common/Reaction/comment/data';
import { like as likeData } from 'app/mock-api/common/Reaction/like/data';
import { open as openData } from 'app/mock-api/common/Reaction/open/data';
import { view as viewData } from 'app/mock-api/common/Reaction/view/data';
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
    likeData = likeData;
    viewData = viewData;
    openData = openData;
    commentData = commentData;
    chart: ApexCharts;
    viewChart: ApexCharts;
    openChart: ApexCharts;
    resizeObserver: ResizeObserver;
    dishStats: DishStats[] = [];
    selectedTable: string = 'likes';

    onTableChange(selectedValue: string) {
        this.selectedTable = selectedValue;
        console.log('Selected Table:', this.selectedTable);
    }
    ngOnInit(): void {
        console.log(likeData);
        console.log(viewData);
        console.log(openData);
        console.log(commentData);
        this.dishStats = this.getDishStats(likeData, viewData, openData);
        console.log(this.dishStats);
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
                floating: true,
                style: {
                    fontWeight: '550',
                    fontSize: '15px',
                    color: '#000',
                },
            },
        };

        this.chart = new ApexCharts(this.chartContainer.nativeElement, options);
        this.chart.render();
    }

    renderViewChart() {
        this.dishStats.sort((a, b) => b.views - a.views);
        const categories = this.dishStats.map((item) => item.dish);
        const values = this.dishStats.map((item) => item.views);

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
                text: 'Views for Dishes',
                align: 'left',
                floating: true,
                style: {
                    fontWeight: '550',
                    fontSize: '15px',
                    color: '#000',
                },
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
                height: 350,
                width: '100%',
            },
            labels: categories,
            dataLabels: {
                enabled: true,
            },
            title: {
                text: 'Opens for Dishes',
                align: 'left',
                floating: true,
                style: {
                    fontWeight: '550',
                    fontSize: '15px',
                    color: '#000',
                },
            },
        };

        this.openChart = new ApexCharts(
            this.openChartContainer.nativeElement,
            options
        );
        this.openChart.render();
    }
}

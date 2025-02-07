import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import ApexCharts from 'apexcharts';
import {
    feedback,
    feedback2,
    feedback3,
} from 'app/mock-api/common/feedback/data';
import { MatListModule } from '@angular/material/list';
import { RestaurantService } from 'app/service/restaurant/restaurant.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-feedback',
    imports: [
        MatCardModule,
        MatTableModule,
        MatListModule,
        MatIconModule,
        MatMenuModule,
    ],
    templateUrl: './feedback.component.html',
    styleUrl: './feedback.component.scss',
})
export class FeedbackComponent implements OnInit {
    @ViewChild('donutChart', { static: true }) donutChart: ElementRef;
    feedbackData = feedback;
    ratingCount: { [key: string]: number } = {
        one: 0,
        two: 0,
        three: 0,
        four: 0,
        five: 0,
    };
    mostFiveStar = { dish: '', count: 0 };
    mostFourStar = { dish: '', count: 0 };
    mostThreeStar = { dish: '', count: 0 };
    mostTwoStar = { dish: '', count: 0 };
    mostOneStar = { dish: '', count: 0 };
    chart: ApexCharts;
    resizeObserver: ResizeObserver;
    columns: string[] = ['name', 'email', 'dish', 'rating', 'feedback', 'date'];
    selectedRestaurant: string = 'Restaurant 1';
    icon: 'heroicons_outline:bars-3';

    constructor(private _restaurantService: RestaurantService) {}

    ngOnInit(): void {
        this.calculateFeedbackDetails();
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
        if (this.chart) {
            this.chart.destroy();
        }
    }

    calculateFeedbackDetails() {
        this.ratingCount = {
            one: 0,
            two: 0,
            three: 0,
            four: 0,
            five: 0,
        };
        this.mostFiveStar = { dish: '', count: 0 };
        this.mostFourStar = { dish: '', count: 0 };
        this.mostThreeStar = { dish: '', count: 0 };
        this.mostTwoStar = { dish: '', count: 0 };
        this.mostOneStar = { dish: '', count: 0 };
        this.feedbackData.forEach((feedback) => {
            if (feedback.rating === 1) {
                this.ratingCount['one']++;
                this.updateMostRatedDish(
                    feedback.dish,
                    feedback.rating,
                    this.mostOneStar
                );
            } else if (feedback.rating === 2) {
                this.ratingCount['two']++;
                this.updateMostRatedDish(
                    feedback.dish,
                    feedback.rating,
                    this.mostTwoStar
                );
            } else if (feedback.rating === 3) {
                this.ratingCount['three']++;
                this.updateMostRatedDish(
                    feedback.dish,
                    feedback.rating,
                    this.mostThreeStar
                );
            } else if (feedback.rating === 4) {
                this.ratingCount['four']++;
                this.updateMostRatedDish(
                    feedback.dish,
                    feedback.rating,
                    this.mostFourStar
                );
            } else if (feedback.rating === 5) {
                this.ratingCount['five']++;
                this.updateMostRatedDish(
                    feedback.dish,
                    feedback.rating,
                    this.mostFiveStar
                );
            }
        });

        console.log('RatingCount:', this.ratingCount);
        console.log('Most 5-Star Dish:', this.mostFiveStar);
        console.log('Most 4-Star Dish:', this.mostFourStar);
        console.log('Most 3-Star Dish:', this.mostThreeStar);
        console.log('Most 2-Star Dish:', this.mostTwoStar);
        console.log('Most 1-Star Dish:', this.mostOneStar);
    }

    updateMostRatedDish(
        dish: string,
        rating: number,
        ratingCategory: { dish: string; count: number }
    ) {
        const count = this.getDishRatingCount(dish, rating);
        if (count > ratingCategory.count) {
            ratingCategory.dish = dish;
            ratingCategory.count = count;
        }
    }

    getDishRatingCount(dish: string, rating: number) {
        return this.feedbackData.filter(
            (feedback) => feedback.dish === dish && feedback.rating === rating
        ).length;
    }

    initializeChart() {
        let resizeTimeout: any;
        this.resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.chart) {
                    this.chart.destroy();
                }
                this.renderChart();
            }, 100);
        });

        this.resizeObserver.observe(this.donutChart.nativeElement);
    }

    renderChart() {
        const sortedRatings = Object.entries(this.ratingCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const categories = sortedRatings.map((item) => item[0]);
        const values = sortedRatings.map((item) => item[1]);
        console.log(values);

        var options = {
            series: values,
            chart: {
                type: 'donut',
                height: '350',
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

        this.chart = new ApexCharts(this.donutChart.nativeElement, options);
        this.chart.render();
    }

    updateRestaurantData() {
        if (this.selectedRestaurant === 'Restaurant 1') {
            this.feedbackData = feedback;
        } else if (this.selectedRestaurant === 'Restaurant 2') {
            this.feedbackData = feedback2;
        } else if (this.selectedRestaurant === 'Restaurant 3') {
            this.feedbackData = feedback3;
        }

        this.calculateFeedbackDetails();
        this.initializeChart();
    }

    exportToCSV() {
        const csvData = this.feedbackData.map((row) => ({
            Name: row.name,
            Email: row.email,
            Dishes: row.dish,
            TableNumber: row.rating,
            Feedback: row.feedback,
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
            this.feedbackData.map((row) => ({
                Name: row.name,
                Email: row.email,
                Dishes: row.dish,
                TableNumber: row.rating,
                Feedback: row.feedback,
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

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import ApexCharts from 'apexcharts';
import { feedback as feedbackData } from 'app/mock-api/common/feedback/data';

@Component({
    selector: 'app-feedback',
    imports: [MatCardModule, MatTableModule],
    templateUrl: './feedback.component.html',
    styleUrl: './feedback.component.scss',
})
export class FeedbackComponent implements OnInit {
    @ViewChild('donutChart', { static: true }) donutChart: ElementRef;
    feedbackData = feedbackData;
    ratingCount: { [key: string]: number } = {
        one: 0,
        two: 0,
        three: 0,
        four: 0,
        five: 0,
    };
    mostFiveStar = { dish: '', count: 0 };
    mostFourStar = { dish: '', count: 0 };
    mostTwoStar = { dish: '', count: 0 };
    mostOneStar = { dish: '', count: 0 };
    chart: ApexCharts;
    resizeObserver: ResizeObserver;
    columns: string[] = ['name', 'email', 'dish', 'rating', 'feedback', 'date'];

    ngOnInit(): void {
        this.calculateFeedbackDetails();
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
        feedbackData.forEach((feedback) => {
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
        return feedbackData.filter(
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
        const sortedAllergies = Object.entries(this.ratingCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const categories = sortedAllergies.map((item) => item[0]);
        const values = sortedAllergies.map((item) => item[1]);
        console.log(values);

        const options = {
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
                text: 'Ratings',
                align: 'left',
                floating: true,
                style: {
                    fontWeight: '550',
                    fontSize: '15px',
                    color: '#000',
                },
            },
        };

        this.chart = new ApexCharts(this.donutChart.nativeElement, options);
        this.chart.render();
    }
}

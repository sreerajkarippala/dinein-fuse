import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import ApexCharts from 'apexcharts';
import { health, health2, health3 } from 'app/mock-api/common/health/data';
import { RestaurantService } from 'app/service/restaurant/restaurant.service';

@Component({
    selector: 'app-health',
    standalone: true,
    imports: [MatCardModule, MatTableModule],
    templateUrl: './health.component.html',
    styleUrl: './health.component.scss',
})
export class HealthComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('donutChart', { static: true }) donutChart: ElementRef;
    @ViewChild('barChartContainer', { static: true })
    barChartContainer: ElementRef;
    allergyCount: { [key: string]: number } = {};
    allergyItemsCount: { [key: string]: number } = {};
    healthData = health;
    chart: ApexCharts;
    barChart: ApexCharts;
    resizeObserver: ResizeObserver;
    columns: string[] = ['name', 'email', 'allergy', 'item'];
    selectedRestaurant: string = 'Restaurant 1';

    constructor(private _restaurantService: RestaurantService) {}
    ngOnInit(): void {
        console.log(this.healthData);
        this.calculateAllergyCount();
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
        if (this.barChart) {
            this.barChart.destroy();
        }
    }

    calculateAllergyCount() {
        this.allergyCount = {};
        this.allergyItemsCount = {};
        this.healthData.forEach((entry) => {
            entry.allergy.forEach((issue) => {
                if (this.allergyCount[issue]) {
                    this.allergyCount[issue]++;
                } else {
                    this.allergyCount[issue] = 1;
                }
            });
        });

        this.healthData.forEach((entry) => {
            entry.item.forEach((dish) => {
                if (this.allergyItemsCount[dish]) {
                    this.allergyItemsCount[dish]++;
                } else {
                    this.allergyItemsCount[dish] = 1;
                }
            });
        });
        console.log('AllergyCount: ', this.allergyCount);
        console.log('AllergyItemsCount:', this.allergyItemsCount);
    }

    initializeChart() {
        let resizeTimeout: any;
        this.resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.chart) {
                    this.chart.destroy();
                }
                if (this.barChart) {
                    this.barChart.destroy();
                }
                this.renderChart();
                this.renderBarChart();
            }, 100); // Adjust the debounce time as needed
        });

        this.resizeObserver.observe(this.donutChart.nativeElement);
        this.resizeObserver.observe(this.barChartContainer.nativeElement); // Added
    }

    renderChart() {
        const sortedAllergies = Object.entries(this.allergyCount)
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
                text: 'Top Allergies',
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

        this.chart = new ApexCharts(this.donutChart.nativeElement, options);
        this.chart.render();
    }

    renderBarChart() {
        const sortedAllergiesItems = Object.entries(this.allergyItemsCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const categories = sortedAllergiesItems.map((item) => item[0]);
        const values = sortedAllergiesItems.map((item) => item[1]);

        const options = {
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
                text: 'Allery causing Items',
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

        this.barChart = new ApexCharts(
            this.barChartContainer.nativeElement,
            options
        );
        this.barChart.render();
    }

    updateRestaurantData() {
        if (this.selectedRestaurant === 'Restaurant 1') {
            this.healthData = health;
        } else if (this.selectedRestaurant === 'Restaurant 2') {
            this.healthData = health2;
        } else if (this.selectedRestaurant === 'Restaurant 3') {
            this.healthData = health3;
        }

        this.calculateAllergyCount();
        this.initializeChart();
    }
}

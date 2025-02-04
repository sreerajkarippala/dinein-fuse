import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatTable, MatTableModule } from '@angular/material/table';
import ApexCharts from 'apexcharts';
import { search, search2, search3 } from 'app/mock-api/common/searchData/data';
import { RestaurantService } from 'app/service/restaurant/restaurant.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [MatTable, MatTableModule, MatCard, MatCardModule],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
    searchCount: { [key: string]: number } = {};
    chart: ApexCharts;
    resizeObserver: ResizeObserver;
    trendingSearch: { name: string; count: number } | null = null;
    leastSearch: { name: string; count: number } | null = null;
    searchData = search;
    columns = ['email', 'searchQuery', 'date'];
    selectedRestaurant: string = 'Restaurant 1';

    constructor(private _restaurantService: RestaurantService) {}

    ngOnInit(): void {
        this.calculateSearchCount();
        console.log(this.searchData);
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

    calculateSearchCount() {
        this.searchCount = {};
        this.searchData.forEach((entry) => {
            entry.searchQuery.forEach((dish) => {
                if (this.searchCount[dish]) {
                    this.searchCount[dish]++;
                } else {
                    this.searchCount[dish] = 1;
                }
            });
        });
        console.log('searchCount:', this.searchCount);
        const searchArray = Object.entries(this.searchCount).map(
            ([name, count]) => ({ name, count })
        );

        if (searchArray.length > 0) {
            this.trendingSearch = searchArray.reduce(
                (max, item) => (item.count > max.count ? item : max),
                searchArray[0]
            );
            this.leastSearch = searchArray.reduce(
                (min, item) => (item.count < min.count ? item : min),
                searchArray[0]
            );
        }
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
        const sortedDishes = Object.entries(this.searchCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const categories = sortedDishes.map((item) => item[0]);
        const values = sortedDishes.map((item) => item[1]);
        console.log(values);

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
                text: 'Top Trending Search',
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

    updateRestaurantData() {
        if (this.selectedRestaurant === 'Restaurant 1') {
            this.searchData = search;
        } else if (this.selectedRestaurant === 'Restaurant 2') {
            this.searchData = search2;
        } else if (this.selectedRestaurant === 'Restaurant 3') {
            this.searchData = search3;
        }

        this.calculateSearchCount();
        this.initializeChart();
    }
}

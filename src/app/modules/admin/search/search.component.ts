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
import { search as searchData } from 'app/mock-api/common/searchData/data';

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
    searchData = searchData;
    columns = ['email', 'searchQuery', 'date'];

    ngOnInit(): void {
        this.calculateSearchCount();
        console.log(searchData);
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
        searchData.forEach((entry) => {
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
                text: 'Top Moving Dishes',
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
}

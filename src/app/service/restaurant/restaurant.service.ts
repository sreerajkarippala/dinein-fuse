import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RestaurantService {
    private selectedRestaurantSubject = new BehaviorSubject<string>(
        'Restaurant 1'
    );
    selectedRestaurant$ = this.selectedRestaurantSubject.asObservable();

    setSelectedRestaurant(restaurant: string): void {
        this.selectedRestaurantSubject.next(restaurant);
    }

    getSelectedRestaurant(): string {
        return this.selectedRestaurantSubject.getValue();
    }
}

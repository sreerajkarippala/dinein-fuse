// import { Injectable } from '@angular/core';
// import { FuseMockApiService, FuseMockApiUtils } from '@fuse/lib/mock-api';

// import { overView as overViewData } from './data';
// import { assign, cloneDeep } from 'lodash-es';

// @Injectable({ providedIn: 'root' })
// export class overViewMockApi {
//     private _overView: any = overViewData;

//     /**
//      * Constructor
//      */
//     constructor(private _fuseMockApiService: FuseMockApiService) {
//         // Register Mock API handlers
//         this.registerHandlers();
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Public methods
//     // -----------------------------------------------------------------------------------------------------

//     /**
//      * Register Mock API handlers
//      */
//     registerHandlers(): void {
//         // -----------------------------------------------------------------------------------------------------
//         // @ Notifications - GET
//         // -----------------------------------------------------------------------------------------------------
//         this._fuseMockApiService
//             .onGet('api/common/overview')
//             .reply(() => [200, cloneDeep(this._overView)]);

//         // -----------------------------------------------------------------------------------------------------
//         // @ Notifications - POST
//         // -----------------------------------------------------------------------------------------------------
//         this._fuseMockApiService
//             .onPost('api/common/overview')
//             .reply(({ request }) => {
//                 // Get the notification
//                 const newNotification = cloneDeep(request.body.notification);

//                 // Generate a new GUID
//                 newNotification.id = FuseMockApiUtils.guid();

//                 // Unshift the new notification
//                 this._overView.unshift(newNotification);

//                 // Return the response
//                 return [200, newNotification];
//             });

//         // -----------------------------------------------------------------------------------------------------
//         // @ Notifications - PATCH
//         // -----------------------------------------------------------------------------------------------------
//         this._fuseMockApiService
//             .onPatch('api/common/overview')
//             .reply(({ request }) => {
//                 // Get the id and notification
//                 const id = request.body.id;
//                 const notification = cloneDeep(request.body.notification);

//                 // Prepare the updated notification
//                 let updatedNotification = null;

//                 // Find the notification and update it
//                 this._overView.forEach(
//                     (item: any, index: number, overview: any[]) => {
//                         if (item.id === id) {
//                             // Update the notification
//                             overview[index] = assign(
//                                 {},
//                                 overview[index],
//                                 notification
//                             );

//                             // Store the updated notification
//                             updatedNotification = overview[index];
//                         }
//                     }
//                 );

//                 // Return the response
//                 return [200, updatedNotification];
//             });

//         // -----------------------------------------------------------------------------------------------------
//         // @ Notifications - DELETE
//         // -----------------------------------------------------------------------------------------------------
//         this._fuseMockApiService
//             .onDelete('api/common/overview')
//             .reply(({ request }) => {
//                 // Get the id
//                 const id = request.params.get('id');

//                 // Prepare the deleted notification
//                 let deletedNotification = null;

//                 // Find the notification
//                 const index = this._overView.findIndex(
//                     (item: any) => item.id === id
//                 );

//                 // Store the deleted notification
//                 deletedNotification = cloneDeep(this._overView[index]);

//                 // Delete the notification
//                 this._overView.splice(index, 1);

//                 // Return the response
//                 return [200, deletedNotification];
//             });

//         // -----------------------------------------------------------------------------------------------------
//         // @ Mark all as read - GET
//         // -----------------------------------------------------------------------------------------------------
//         this._fuseMockApiService
//             .onGet('api/common/overview/mark-all-as-read')
//             .reply(() => {
//                 // Go through all overview
//                 this._overView.forEach(
//                     (item: any, index: number, overview: any[]) => {
//                         // Mark it as read
//                         overview[index].read = true;
//                         overview[index].seen = true;
//                     }
//                 );

//                 // Return the response
//                 return [200, true];
//             });

//         // -----------------------------------------------------------------------------------------------------
//         // @ Toggle read status - POST
//         // -----------------------------------------------------------------------------------------------------
//         this._fuseMockApiService
//             .onPost('api/common/overview/toggle-read-status')
//             .reply(({ request }) => {
//                 // Get the notification
//                 const notification = cloneDeep(request.body.notification);

//                 // Prepare the updated notification
//                 let updatedNotification = null;

//                 // Find the notification and update it
//                 this._overView.forEach(
//                     (item: any, index: number, overview: any[]) => {
//                         if (item.id === notification.id) {
//                             // Update the notification
//                             overview[index].read = notification.read;

//                             // Store the updated notification
//                             updatedNotification = overview[index];
//                         }
//                     }
//                 );

//                 // Return the response
//                 return [200, updatedNotification];
//             });
//     }
// }

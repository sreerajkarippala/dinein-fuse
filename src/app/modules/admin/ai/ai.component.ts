import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import ApexCharts from 'apexcharts';

@Component({
    selector: 'app-ai',
    imports: [MatIconModule, MatFormField, MatInput],
    templateUrl: './ai.component.html',
    styleUrl: './ai.component.scss',
})
// export class AiComponent {
//     @ViewChild('messageInput') messageInput: MatInput;
//     messages: { text: string; sender: 'user' | 'bot' }[] = [];
//     showGraph: boolean = false;

//     sendMessage(): void {
//         const message = this.messageInput.value.trim();
//         if (message) {
//             console.log('Message sent:', message);

//             this.messageInput.value = '';
//         }
//     }
// }
export class ChatComponent implements AfterViewInit {
    @ViewChild('messageInput') messageInput: ElementRef;
    @ViewChild('messagesContainer') messagesContainer: ElementRef;
    @ViewChild('graphContainer') graphContainer: ElementRef;

    ngAfterViewInit(): void {}

    sendMessage(): void {
        const message = this.messageInput.nativeElement.value.trim();
        if (message) {
            this.displayMessage(message, 'user');

            if (message.toLowerCase() === 'hi') {
                this.displayMessage('Hello There!', 'bot');
            } else if (message.toLowerCase() === 'graph') {
                this.generateBarGraph();
            }

            this.messageInput.nativeElement.value = '';
        }
    }

    displayMessage(message: string, sender: 'user' | 'bot'): void {
        const messageElement = document.createElement('div');
        messageElement.classList.add(
            'flex',
            'flex-col',
            sender === 'user' ? 'items-end' : 'items-start'
        );

        const bubble = document.createElement('div');
        bubble.classList.add(
            'max-w-3/4',
            'rounded-lg',
            'px-3',
            'py-2',
            sender === 'user' ? 'bg-blue-500' : 'bg-gray-500',
            'text-white'
        );
        bubble.textContent = message;

        messageElement.appendChild(bubble);
        this.messagesContainer.nativeElement.appendChild(messageElement);
        this.messagesContainer.nativeElement.scrollTop =
            this.messagesContainer.nativeElement.scrollHeight;
    }

    generateBarGraph(): void {
        this.graphContainer.nativeElement.innerHTML = '';

        const options = {
            series: [
                {
                    name: 'Data',
                    data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
                },
            ],
            chart: {
                type: 'bar',
                height: 350,
            },
            xaxis: {
                categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                ],
            },
        };

        const chart = new ApexCharts(
            this.graphContainer.nativeElement,
            options
        );
        chart.render();
    }
}

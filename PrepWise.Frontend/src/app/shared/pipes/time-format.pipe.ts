import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {
    transform(seconds: number, format: 'short' | 'long' | 'minimal' = 'short'): string {
        if (!seconds || seconds < 0) {
            return '00:00';
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        switch (format) {
            case 'long':
                return this.formatLong(hours, minutes, secs);
            case 'minimal':
                return this.formatMinimal(hours, minutes, secs);
            case 'short':
            default:
                return this.formatShort(hours, minutes, secs);
        }
    }

    private formatShort(hours: number, minutes: number, seconds: number): string {
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    private formatLong(hours: number, minutes: number, seconds: number): string {
        const parts: string[] = [];

        if (hours > 0) {
            parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        }

        if (minutes > 0) {
            parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        }

        if (seconds > 0 || parts.length === 0) {
            parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
        }

        return parts.join(', ');
    }

    private formatMinimal(hours: number, minutes: number, seconds: number): string {
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
} 
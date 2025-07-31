import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
    transform(
        value: string,
        limit: number = 100,
        completeWords: boolean = true,
        ellipsis: string = '...'
    ): string {
        if (!value || value.length <= limit) {
            return value;
        }

        if (completeWords) {
            // Truncate at word boundaries
            let truncated = value.substr(0, limit);
            const lastSpace = truncated.lastIndexOf(' ');

            if (lastSpace > 0) {
                truncated = truncated.substr(0, lastSpace);
            }

            return truncated + ellipsis;
        } else {
            // Simple character truncation
            return value.substr(0, limit) + ellipsis;
        }
    }
} 
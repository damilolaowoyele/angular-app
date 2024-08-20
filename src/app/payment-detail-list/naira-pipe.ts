import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'naira',
})
export class NairaPipe implements PipeTransform {
  transform(value: number): string {
    if (isNaN(value)) return '₦0.00';

    const formatted = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

    // Replace the NGN symbol with ₦
    return formatted.replace('NGN', '₦');
  }
}

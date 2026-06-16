import { Injectable } from '@angular/core';
import { ToWords } from 'to-words';

@Injectable({
  providedIn: 'root',
})
export class NumToWordsService {
  convertAmountToWords(amount: number) {
    const toWords = new ToWords({
      localeCode: 'en-IN',
      converterOptions: {
        currency: true,
        ignoreDecimal: true,
        ignoreZeroCurrency: true,
        doNotAddOnly: true,
        currencyOptions: {
          name: 'Rupee',
          plural: 'Rupees',
          symbol: '₹',
          fractionalUnit: {
            name: 'Paisa',
            plural: 'Paise',
            symbol: '',
          },
        },
      },
    });

    return toWords.convert(amount);
  }

  convertNumToWords(num: number) {
    const toWords = new ToWords({
      localeCode: 'en-IN',
      converterOptions: {
        currency: false,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: true,
      },
    });

    return toWords.convert(num);
  }
}

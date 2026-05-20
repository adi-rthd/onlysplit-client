// src/services/currencyService.js

import axios from 'axios';

const SUPPORTED_CURRENCIES = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'CAD',
  'AUD',
  'SGD',
];

const currencyApi = axios.create({
  baseURL: 'https://api.frankfurter.dev/v2',
  timeout: 10000,
});

/**
 * Get all supported currencies
 */
export const getCurrencies = async () => {
  try {
    const response =
      await currencyApi.get('/currencies');

    return response.data.filter(currency =>
      SUPPORTED_CURRENCIES.includes(
        currency.iso_code
      )
    );
  } catch (error) {
    console.error(
      'Failed to fetch currencies:',
      error
    );

    throw error;
  }
};

/**
 * Format currency
 */
export const formatCurrency = (
  amount,
  currencyCode = 'INR',
  locale = 'en-IN'
) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch (error) {
    console.error(
      'Currency formatting failed:',
      error
    );

    return `₹${amount || 0}`;
  }
};

/**
 * Compact currency formatting
 * Example:
 * ₹1.2L
 * $2.3K
 */
export const formatCompact = (
  amount,
  currencyCode = 'INR',
  locale = 'en-IN'
) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode || 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(Number(amount || 0));
  } catch (error) {
    console.error(
      'Compact formatting failed:',
      error
    );

    return `₹${amount || 0}`;
  }
};

/**
 * Get exchange rates
 */
export const getRates = async (
  base = 'INR',
  quotes = []
) => {
  try {
    const response = await currencyApi.get(
      '/rates',
      {
        params: {
          base,
          quotes: quotes.join(','),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      'Failed to fetch rates:',
      error
    );

    throw error;
  }
};

/**
 * Get single exchange rate
 */
export const getRate = async (
  base = 'INR',
  quote = 'USD'
) => {
  try {
    const response = await currencyApi.get(
      `/rate/${base}/${quote}`
    );

    return response.data;
  } catch (error) {
    console.error(
      'Failed to fetch rate:',
      error
    );

    throw error;
  }
};

/**
 * Convert currency
 */
export const convertCurrency = async (
  amount,
  base = 'INR',
  quote = 'USD'
) => {
  try {
    const response = await getRate(
      base,
      quote
    );

    const convertedAmount = Number(
      (
        Number(amount || 0) * response.rate
      ).toFixed(2)
    );

    return {
      amount: Number(amount || 0),

      formattedAmount: formatCurrency(
        amount,
        base
      ),

      base,

      quote,

      rate: response.rate,

      convertedAmount,

      formattedConvertedAmount:
        formatCurrency(
          convertedAmount,
          quote
        ),

      date: response.date,
    };
  } catch (error) {
    console.error(
      'Currency conversion failed:',
      error
    );

    throw error;
  }
};
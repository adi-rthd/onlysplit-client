import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import settlementPaymentService from '../../services/settlementPaymentService';

/**
 * Fetches all payments for a given settlement.
 * Maps to: GET /api/settlements/{settlementId}/payments
 */
export function useSettlementPayments(settlementId, options = {}) {
  return useQuery({
    queryKey: queryKeys.settlements.payments(settlementId),
    queryFn: () => settlementPaymentService.getPayments(settlementId),
    enabled: !!settlementId,
    staleTime: 30 * 1000,
    ...options,
  });
}

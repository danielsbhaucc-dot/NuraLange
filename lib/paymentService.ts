/**
 * תשתית תשלומים — מוכנה לחיבור לספק (Stripe, PayPlus, Tranzila וכו')
 * כרגע מדמה רכישות מקומית לפיתוח
 */

import { SUBSCRIPTION_TIERS, EXTRA_LESSON_PACKS } from '@/lib/pricing';

export type PaymentProvider = 'stripe' | 'payplus' | 'tranzila' | 'mock';

export interface PaymentConfig {
  provider: PaymentProvider;
  apiUrl?: string;
  publicKey?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PaymentRecord {
  id: string;
  type: 'subscription' | 'extra_pack';
  tierId: string;
  packId?: string;
  amountILS: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

const config: PaymentConfig = {
  provider: (process.env.EXPO_PUBLIC_PAYMENT_PROVIDER as PaymentProvider) ?? 'mock',
  apiUrl: process.env.EXPO_PUBLIC_PAYMENT_API_URL,
  publicKey: process.env.EXPO_PUBLIC_PAYMENT_PUBLIC_KEY,
};

class PaymentService {
  private records: PaymentRecord[] = [];

  getConfig(): PaymentConfig {
    return { ...config };
  }

  async purchaseSubscription(tierId: string): Promise<PaymentResult> {
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
    if (!tier) return { success: false, error: 'תוכנית לא נמצאה' };

    return this.processPayment({
      type: 'subscription',
      tierId,
      amountILS: tier.monthlyPriceILS,
    });
  }

  async purchaseExtraPack(packId: string, tierId: string): Promise<PaymentResult> {
    const pack = EXTRA_LESSON_PACKS.find((p) => p.id === packId);
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
    if (!pack || !tier) return { success: false, error: 'חבילה לא נמצאה' };

    return this.processPayment({
      type: 'extra_pack',
      tierId,
      packId,
      amountILS: pack.getPrice(tier),
    });
  }

  private async processPayment(params: {
    type: 'subscription' | 'extra_pack';
    tierId: string;
    packId?: string;
    amountILS: number;
  }): Promise<PaymentResult> {
    const record: PaymentRecord = {
      id: `pay_${Date.now()}`,
      type: params.type,
      tierId: params.tierId,
      packId: params.packId,
      amountILS: params.amountILS,
      timestamp: Date.now(),
      status: 'pending',
    };

    if (config.provider === 'mock' || !config.apiUrl) {
      await this.simulateDelay();
      record.status = 'completed';
      this.records.push(record);
      return { success: true, transactionId: record.id };
    }

    try {
      const response = await fetch(`${config.apiUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.publicKey ?? ''}`,
        },
        body: JSON.stringify({
          provider: config.provider,
          ...params,
          currency: 'ILS',
          successUrl: 'nuralange://payment/success',
          cancelUrl: 'nuralange://payment/cancel',
        }),
      });

      if (!response.ok) {
        record.status = 'failed';
        this.records.push(record);
        return { success: false, error: 'התשלום נכשל' };
      }

      const data = await response.json();
      record.status = 'completed';
      this.records.push(record);
      return { success: true, transactionId: data.transactionId ?? record.id };
    } catch {
      record.status = 'failed';
      this.records.push(record);
      return { success: false, error: 'שגיאת רשת' };
    }
  }

  getHistory(): PaymentRecord[] {
    return [...this.records];
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 800));
  }
}

export const paymentService = new PaymentService();

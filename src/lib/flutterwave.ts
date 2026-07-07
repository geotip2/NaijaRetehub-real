import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  callback?: (response: any) => void;
  onClose?: () => void;
}

export const usePayWithFlutterwave = (config: any, onSuccess: (response: any) => void, onClose: () => void) => {
  const handleFlutterwavePayment = useFlutterwave({
    ...config,
    callback: (response: any) => {
      onSuccess(response);
      closePaymentModal();
    },
    onClose: () => {
      onClose();
    },
  });

  return handleFlutterwavePayment;
};

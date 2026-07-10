import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

interface PaymentButtonProps {
  plan: any;
  user: any;
  onSuccess: (planId: string) => void;
  className?: string;
}

export default function PaymentButton({ plan, user, onSuccess, className }: PaymentButtonProps) {
  const config = {
    public_key: import.meta.env.VITE_FLW_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOX-KEY',
    tx_ref: `NRH-${Date.now()}`,
    amount: plan.price,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || '',
      phone_number: '0000000000',
      name: user?.email?.split('@')[0] || 'User',
    },
    customizations: {
      title: 'NaijaRemoteHub Membership',
      description: `Upgrade to ${plan.name} Membership. Note: Beneficiary account name is PETAI`,
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-abstract-logo-template.jpg',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  return (
    <button
      className={className}
      onClick={() => {
        handleFlutterPayment({
          callback: (response: any) => {
             console.log('Flutterwave response:', response);
             if (response.status === "successful") {
               onSuccess(plan.id);
             }
             closePaymentModal();
          },
          onClose: () => {},
        });
      }}
    >
      {plan.cta}
    </button>
  );
}

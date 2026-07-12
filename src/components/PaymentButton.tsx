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
      logo: 'https://cdn.iconscout.com/icon/free/png-256/flutterwave-226462.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  return (
    <button
      className={className}
      onClick={() => {
        try {
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
        } catch (error) {
          console.error("Flutterwave error:", error);
          alert("Could not load payment modal. Please try again later.");
        }
      }}
    >
      {plan.cta}
    </button>
  );
}

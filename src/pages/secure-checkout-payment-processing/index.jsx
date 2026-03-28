import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Lock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';
import { marketplaceService } from '../../services/marketplaceService';
import Button from '../../components/ui/Button';
import CheckoutForm from './components/CheckoutForm';
import CartSummary from './components/CartSummary';
import LicenseSelector from './components/LicenseSelector';
import OrderConfirmation from './components/OrderConfirmation';
import Icon from '../../components/AppIcon';


const stripePromise = loadStripe(import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY);

export default function SecureCheckoutPaymentProcessing() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [sound, setSound] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [completedPurchase, setCompletedPurchase] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const soundId = searchParams?.get('soundId');

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    loadCheckoutData();
  }, [soundId, isAuthenticated]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!soundId) {
        throw new Error('No sound selected for checkout');
      }

      // Get sound details with licenses
      const sounds = await marketplaceService?.getSounds({ soundId });
      const soundData = sounds?.[0];

      if (!soundData) {
        throw new Error('Sound not found');
      }

      // Get licenses for this sound
      const licenses = await marketplaceService?.getLicenses(soundId);
      soundData.licenses = licenses;

      setSound(soundData);
      setSelectedLicense(licenses?.[0]);
    } catch (err) {
      setError(err?.message || 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseSelect = (license) => {
    setSelectedLicense(license);
  };

  const handleProceedToPayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      if (!selectedLicense) {
        throw new Error('Please select a license');
      }

      // Create payment intent
      const { clientSecret: secret, paymentIntentId: intentId } = await paymentService?.createPaymentIntent({
        amount: selectedLicense?.price,
        soundId: sound?.id,
        licenseId: selectedLicense?.id,
        producerId: sound?.producerId
      });

      setClientSecret(secret);
      setPaymentIntentId(intentId);
      setCurrentStep(2);
    } catch (err) {
      setError(err?.message || 'Failed to initialize payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setProcessing(true);

      // Confirm payment and create purchase record
      const purchase = await paymentService?.confirmPayment(paymentIntent?.id, {
        soundId: sound?.id,
        licenseId: selectedLicense?.id,
        producerId: sound?.producerId,
        amount: selectedLicense?.price
      });

      setCompletedPurchase(purchase);
      setCurrentStep(3);
    } catch (err) {
      setError(err?.message || 'Payment confirmation failed');
    } finally {
      setProcessing(false);
    }
  };

  const steps = [
    { number: 1, label: 'License Selection', icon: FileText },
    { number: 2, label: 'Payment', icon: CreditCard },
    { number: 3, label: 'Confirmation', icon: CheckCircle }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <HeaderNavigation
          isAuthenticated={false}
          onAuthClick={() => navigate('/login')}
          onLogout={() => {}}
        />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md px-4">
            <Lock className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to complete your purchase</p>
            <Button
              onClick={() => navigate('/login')}
              className="bg-cyan-500 text-black hover:bg-cyan-400"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <HeaderNavigation isAuthenticated={isAuthenticated} onLogout={() => {}} onAuthClick={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !sound) {
    return (
      <div className="min-h-screen bg-black">
        <HeaderNavigation isAuthenticated={isAuthenticated} onLogout={() => {}} onAuthClick={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Checkout Error</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => navigate('/community-sound-marketplace')}
              className="bg-cyan-500 text-black hover:bg-cyan-400"
            >
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <HeaderNavigation isAuthenticated={isAuthenticated} onLogout={() => {}} onAuthClick={() => {}} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Secure Checkout</h1>
          <p className="text-gray-400">Complete your purchase securely with Stripe</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {steps?.map((step, index) => {
              const Icon = step?.icon;
              const isActive = currentStep === step?.number;
              const isCompleted = currentStep > step?.number;

              return (
                <div key={step?.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-green-500 border-green-500'
                          : isActive
                          ? 'bg-cyan-500 border-cyan-500' :'bg-gray-800 border-gray-700'
                      }`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-cyan-500' : isCompleted ? 'text-green-500' : 'text-gray-500'
                      }`}
                    >
                      {step?.label}
                    </span>
                  </div>
                  {index < steps?.length - 1 && (
                    <div
                      className={`w-24 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-500 font-medium">Payment Error</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="space-y-6">
                <LicenseSelector
                  sound={sound}
                  licenses={sound?.licenses || []}
                  selectedLicense={selectedLicense}
                  onSelectLicense={handleLicenseSelect}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!selectedLicense || processing}
                    className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold px-8"
                  >
                    {processing ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  amount={selectedLicense?.price}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => setError(err?.message)}
                />
              </Elements>
            )}

            {currentStep === 3 && completedPurchase && (
              <OrderConfirmation
                purchase={completedPurchase}
                sound={sound}
                license={selectedLicense}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CartSummary
              sound={sound}
              selectedLicense={selectedLicense}
              currentStep={currentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
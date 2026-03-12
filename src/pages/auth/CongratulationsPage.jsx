import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

function CongratulationsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/institution-admin/dashboard', { replace: true });
    }, 5000); // 5-second delay

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Congratulations!</h1>
        <p className="text-gray-600 mb-6">Your institution has been verified.</p>
        <p className="text-sm text-gray-500">You will be redirected to your dashboard shortly.</p>
      </div>
    </div>
  );
}

export default CongratulationsPage;

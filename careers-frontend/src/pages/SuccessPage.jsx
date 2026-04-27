import { Link } from 'react-router-dom';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';

const SuccessPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-12">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Registration Complete!</h1>
        
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          We have successfully received your payment and application. Your registration is currently under review.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-600" />
            What happens next?
          </h3>
          <ul className="space-y-3 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold mr-3 shrink-0">1</span>
              Our team will review your application within 24-48 hours.
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold mr-3 shrink-0">2</span>
              Once approved, you will receive two important emails.
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold mr-3 shrink-0">3</span>
              The first email will contain your official <strong>Offer Letter</strong>.
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold mr-3 shrink-0">4</span>
              The second email will contain instructions to access your <strong>Student Portal</strong>.
            </li>
          </ul>
        </div>

        <Link 
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
        >
          Return to Home <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;

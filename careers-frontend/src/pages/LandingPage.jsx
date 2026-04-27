import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, MapPin, Clock, IndianRupee, ArrowRight, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await axios.get('/api/public/internships/batches');
        setBatches(res.data.internships || res.data.batches || []);
      } catch (error) {
        console.error('Failed to fetch batches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-white py-20 px-6 md:px-12 border-b border-slate-200">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Open for Applications
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Launch Your Career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ofzen Internships</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Get hands-on experience, mentorship from industry experts, and build production-ready applications. Elevate your skills from academic to professional.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-world Projects</h3>
            <p className="text-slate-600 text-sm">Work on actual industry projects, not just academic exercises. Learn what it takes to build for scale.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Expert Mentorship</h3>
            <p className="text-slate-600 text-sm">Get 1-on-1 guidance from senior developers. Regular code reviews and architecture discussions.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <ArrowRight className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Career Acceleration</h3>
            <p className="text-slate-600 text-sm">Top performers get PPO (Pre-Placement Offers) and strong letters of recommendation.</p>
          </div>
        </div>
      </section>

      {/* Batches Section */}
      <section id="internships" className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Available Internship Roles</h2>
          <p className="text-slate-600 mt-2">Apply for a role you're passionate about. We'll handle the batch assignment internally.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No active roles</h3>
            <p className="text-slate-500 mt-1">Check back later or join our waitlist.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {batches.map((batch) => (
              <div key={batch._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-50 transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>
                
                <div className="relative z-10 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {batch.domain}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${batch.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {batch.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{batch.title}</h3>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    {batch.description || `Build production-ready skills in ${batch.domain}. Get hands-on experience and mentorship.`}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-3 text-slate-400" />
                      8-12 Weeks (Self-paced / Guided)
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                      Remote / Hybrid
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <IndianRupee className="w-4 h-4 mr-3 text-slate-400" />
                      <span className="font-semibold text-slate-900">{batch.fee.toLocaleString()}</span>&nbsp;Registration Fee
                    </div>
                  </div>
                </div>
                
                <div className="relative z-10 mt-auto pt-6 border-t border-slate-100">
                  <Link 
                    to={`/register/${batch._id}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;

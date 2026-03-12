import { useState, useEffect, useMemo } from 'react';
import { institutionsApi } from '../../api/endpoints';
import { INSTITUTION_STATUS } from '../../utils/constants';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { 
  Check, 
  X, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Search, 
  Filter, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Eye,
  Info
} from 'lucide-react';

export default function AdminInstitutions() {
  const { fetchPendingInstitutions } = useNotifications();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedInst, setSelectedInst] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const res = await institutionsApi.list();
      if (res.data.success) {
        setInstitutions(res.data.institutions);
      }
    } catch (err) {
      setError('Failed to load institution applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const stats = useMemo(() => {
    return {
      total: institutions.length,
      pending: institutions.filter(i => i.status === INSTITUTION_STATUS.PENDING_VERIFICATION).length,
      verified: institutions.filter(i => i.status === INSTITUTION_STATUS.VERIFIED).length,
      rejected: institutions.filter(i => i.status === INSTITUTION_STATUS.REJECTED).length,
    };
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inst.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inst.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'ALL' || inst.status === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [institutions, searchTerm, activeTab]);

  const handleUpdateStatus = async (id, status) => {
    if (status === INSTITUTION_STATUS.REJECTED && !verificationNotes.trim()) {
      alert('Please provide a reason for rejection in the Verification Notes field.');
      return;
    }
    
    setActionLoading(id);
    try {
      const res = await institutionsApi.updateStatus(id, status, verificationNotes);
      if (res.data.success) {
        setInstitutions((prev) =>
          prev.map((inst) => (inst._id === id ? { ...inst, status, verificationNotes } : inst))
        );
        setSelectedInst(null);
        setVerificationNotes('');
        if (fetchPendingInstitutions) {
          fetchPendingInstitutions();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Applications', count: stats.total, icon: Building2 },
    { id: INSTITUTION_STATUS.PENDING_VERIFICATION, label: 'Pending', count: stats.pending, icon: Clock, color: 'text-amber-500' },
    { id: INSTITUTION_STATUS.VERIFIED, label: 'Verified', count: stats.verified, icon: CheckCircle2, color: 'text-emerald-500' },
    { id: INSTITUTION_STATUS.REJECTED, label: 'Rejected', count: stats.rejected, icon: XCircle, color: 'text-red-500' },
  ];

  if (loading && institutions.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Loading Verification Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Verification Center</h1>
          <p className="text-slate-500 font-medium text-lg">Review and manage institution partnerships</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center min-w-[100px]">
            <span className="text-2xl font-black text-slate-900">{stats.pending}</span>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center min-w-[100px]">
            <span className="text-2xl font-black text-slate-900">{stats.verified}</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color || 'text-primary-500' : 'text-slate-400'}`} />
              {tab.label}
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search institutions..."
            className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-primary-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {filteredInstitutions.length === 0 ? (
        <Card className="text-center py-24 bg-slate-50/30 border-dashed border-2">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-soft-xl">🏢</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Applications Found</h3>
          <p className="text-slate-500 max-w-xs mx-auto">We couldn't find any institution applications matching your criteria.</p>
          {searchTerm && (
            <Button variant="secondary" className="mt-6" onClick={() => setSearchTerm('')}>Clear Search</Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.map((inst) => (
            <Card key={inst._id} className="group hover:shadow-2xl transition-all duration-300 border-slate-100 flex flex-col h-full overflow-hidden">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${
                    inst.status === INSTITUTION_STATUS.VERIFIED ? 'bg-emerald-50 text-emerald-600' :
                    inst.status === INSTITUTION_STATUS.REJECTED ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    inst.status === INSTITUTION_STATUS.VERIFIED ? 'bg-emerald-50 text-emerald-600' :
                    inst.status === INSTITUTION_STATUS.REJECTED ? 'bg-red-50 text-red-600' :
                    'bg-amber-50/50 text-amber-600'
                  }`}>
                    {inst.status.replace('_', ' ')}
                  </div>
                </div>

                <h2 className="text-xl font-black text-slate-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">{inst.name}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{inst.type}</p>
                
                <p className="text-slate-500 text-sm line-clamp-3 font-medium leading-relaxed flex-1">
                  {inst.description || 'No description provided.'}
                </p>

                <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inst.city}, {inst.country}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{inst.contactEmail}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50/50 flex gap-2">
                <Button 
                  className="flex-1 py-2 text-xs" 
                  variant="secondary"
                  onClick={() => setSelectedInst(inst)}
                >
                  <Eye className="w-3.5 h-3.5 mr-2" /> Review Details
                </Button>
                {inst.status === INSTITUTION_STATUS.PENDING_VERIFICATION && (
                  <Button 
                    className="py-2 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setSelectedInst(inst);
                      // Auto-scroll or open modal
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Review Modal */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-0">
            <button 
              onClick={() => setSelectedInst(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center text-3xl">
                  🏢
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedInst.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-primary-600 uppercase tracking-widest">{selectedInst.type}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Applied on {new Date(selectedInst.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">About Institution</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">{selectedInst.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Contact Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <Mail className="w-4 h-4 text-primary-500" /> {selectedInst.contactEmail}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <Phone className="w-4 h-4 text-primary-500" /> {selectedInst.contactPhone}
                      </div>
                      {selectedInst.website && (
                        <a href={selectedInst.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-primary-600 hover:underline">
                          <ExternalLink className="w-4 h-4" /> Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Location</h4>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2">
                      <p className="text-sm font-bold text-slate-900">{selectedInst.addressLine1}</p>
                      {selectedInst.addressLine2 && <p className="text-sm font-bold text-slate-600">{selectedInst.addressLine2}</p>}
                      <p className="text-sm font-bold text-slate-600">{selectedInst.city}, {selectedInst.state}</p>
                      <p className="text-sm font-bold text-slate-600">{selectedInst.country} - {selectedInst.postalCode}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Owner Account</h4>
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500">
                        {selectedInst.owner?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{selectedInst.owner?.name}</p>
                        <p className="text-xs font-bold text-slate-400">{selectedInst.owner?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInst.status === INSTITUTION_STATUS.PENDING_VERIFICATION ? (
                <div className="pt-8 border-t border-slate-100 space-y-6">
                  <div>
                    <label className="block text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary-500" /> Remark (Optional)
                    </label>
                    <textarea
                      placeholder="Add any notes for this decision. These will be stored for audit purposes."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-primary-500 focus:bg-white transition-all min-h-[100px]"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      loading={actionLoading === selectedInst._id}
                      onClick={() => handleUpdateStatus(selectedInst._id, INSTITUTION_STATUS.VERIFIED)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 shadow-xl shadow-emerald-100"
                    >
                      <Check className="w-5 h-5 mr-2" /> Verify & Promote User
                    </Button>
                    <Button
                      loading={actionLoading === selectedInst._id}
                      onClick={() => handleUpdateStatus(selectedInst._id, INSTITUTION_STATUS.REJECTED)}
                      variant="secondary"
                      className="flex-1 border-red-100 text-red-600 hover:bg-red-50 py-4"
                    >
                      <X className="w-5 h-5 mr-2" /> Reject Application
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-8 border-t border-slate-100">
                  <div className={`p-6 rounded-3xl flex items-start gap-4 ${
                    selectedInst.status === INSTITUTION_STATUS.VERIFIED ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    {selectedInst.status === INSTITUTION_STATUS.VERIFIED ? 
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-1" /> : 
                      <XCircle className="w-6 h-6 text-red-600 mt-1" />
                    }
                    <div>
                      <h4 className={`text-lg font-black ${
                        selectedInst.status === INSTITUTION_STATUS.VERIFIED ? 'text-emerald-900' : 'text-red-900'
                      }`}>
                        Application {selectedInst.status === INSTITUTION_STATUS.VERIFIED ? 'Verified' : 'Rejected'}
                      </h4>
                      <p className={`text-sm font-medium mt-1 ${
                        selectedInst.status === INSTITUTION_STATUS.VERIFIED ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        Decision made on {new Date(selectedInst.updatedAt).toLocaleDateString()}
                      </p>
                      {selectedInst.verificationNotes && (
                        <div className="mt-4 p-4 bg-white/50 rounded-2xl text-sm font-medium italic text-slate-600">
                          "{selectedInst.verificationNotes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

import { Briefcase, MapPin, DollarSign, Calendar, Lock } from 'lucide-react';
import { Job } from '../types';
import { formatCurrency } from '../lib/utils';

interface JobCardProps {
  key?: any;
  job: Job;
  isLocked?: boolean;
}

export default function JobCard({ job, isLocked }: JobCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm transition-all hover:border-[#008751] relative overflow-hidden ${isLocked ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      {isLocked && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 p-4 text-center">
          <Lock className="text-[#008751] mb-2" size={32} />
          <p className="font-bold text-gray-900">Starter/Pro Only</p>
          <p className="text-sm text-gray-600">Upgrade to view this job</p>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#008751] bg-[#008751]/10 px-2 py-1 rounded">
            {job.type}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-2">{job.title}</h3>
          <p className="text-gray-600 font-medium">{job.company}</p>
        </div>
        {!job.is_free && (
          <span className="bg-[#FFD700]/20 text-[#B8860B] text-[10px] font-black px-2 py-1 rounded-full uppercase">
            Premium
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center text-gray-500 text-sm">
          <MapPin size={16} className="mr-1" />
          {job.location}
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <DollarSign size={16} className="mr-1" />
          {job.salary || 'Competitive'}
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Briefcase size={16} className="mr-1" />
          {job.category}
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Calendar size={16} className="mr-1" />
          {new Date(job.posted_at).toLocaleDateString()}
        </div>
      </div>

      <a
        href={isLocked ? '#' : job.apply_url}
        target={isLocked ? '_self' : '_blank'}
        rel="noopener noreferrer"
        className={`w-full block text-center py-3 rounded-xl font-bold transition-colors ${
          isLocked 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-[#1A1A1A] text-white hover:bg-[#333]'
        }`}
      >
        {isLocked ? 'Locked' : 'Apply Now'}
      </a>
    </div>
  );
}

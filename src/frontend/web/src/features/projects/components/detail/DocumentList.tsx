import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ValidationDocument as Document } from '../../types';

interface DocumentListProps {
  documents: Document[];
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const { t } = useTranslation();

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-[#223382]">{t('documentList.title')}</h2>
        <span className="text-sm font-medium text-[#223382]/60">{t('documentList.updatedAt')}</span>
      </div>
      <div className="space-y-4">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="flex items-center justify-between p-5 bg-white border border-[#DAD1C8]/30 rounded-xl group hover:shadow-md hover:border-[#F98513]/30 transition-all cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                doc.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                {doc.status === 'verified' ? <CheckCircle2 size={20} /> :
                  doc.status === 'pending' ? <Clock size={20} /> :
                    <XCircle size={20} />}
              </div>
              <span className="font-semibold text-[#111144]">{doc.name}</span>
            </div>
            <span className={`text-[10px] font-bold tracking-tighter px-2 py-1 rounded ${doc.status === 'verified' ? 'bg-green-100 text-green-700' :
              doc.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
              {doc.status.toUpperCase()}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

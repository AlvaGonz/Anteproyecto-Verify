import React from 'react';
import { motion } from 'framer-motion';
import { ValidationTimelineEvent as TimelineEvent } from '../../types';

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <section>
      <h3 className="text-xl font-bold text-[#223382] mb-8">Historial de Validación</h3>
      <div className="relative pl-8 space-y-10">
        <div className="absolute left-3.5 top-2 bottom-2 w-[2px] bg-[#DAD1C8] opacity-30"></div>
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`relative ${event.status !== 'completed' ? 'opacity-60' : ''}`}
          >
            <div className={`absolute -left-8 top-1 w-7 h-7 rounded-full flex items-center justify-center border-4 border-[#fff8f3] ${event.status === 'completed' ? 'bg-[#223382]' : 'bg-[#DAD1C8]'
              }`}>
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </div>
            <p className="text-[10px] font-bold text-[#223382]/60 uppercase tracking-wider mb-1">
              {event.status.toUpperCase()} - {event.date}
            </p>
            <h4 className="font-bold text-[#111144]">{event.title}</h4>
            <p className="text-sm text-[#5C5C5C]">{event.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

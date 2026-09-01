import React, { useState, useEffect } from 'react';
import { fetchPredictions, fetchTrain } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import DelayExplanation from './DelayExplanation';
import DelayBadge from '../shared/DelayBadge';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorBanner from '../shared/ErrorBanner';

export default function TrainDetail({ trainNumber, onClose }) {
  const [train, setTrain] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { trains } = useSocket();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const tData = await fetchTrain(trainNumber);
        setTrain(tData);
        const pData = await fetchPredictions(trainNumber);
        setPredictions(pData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trainNumber]);

  useEffect(() => {
    if (trains.has(trainNumber) && !loading && train) {
      setTrain({ ...train, currentRun: trains.get(trainNumber) });
    }
  }, [trains, trainNumber, loading]);

  if (!train) return null;

  const currentRun = train.currentRun || {};
  const stationLog = currentRun.stationLog || [];
  
  let currentDelay = 0;
  const arrived = stationLog.filter(s => s.arrived);
  if (arrived.length > 0) {
      currentDelay = arrived[arrived.length - 1].delayMinutes || 0;
  }

  const nextStation = stationLog[currentRun.nextStationIndex];
  let currentPrediction = null;
  if (nextStation && predictions && Array.isArray(predictions)) {
      currentPrediction = predictions.find(p => p.stationCode === nextStation.stationCode);
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{train.trainNumber}</h2>
            <p className="text-sm text-slate-500">{train.name || train.trainName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading && <LoadingSpinner text="Loading details..." />}
          {error && <ErrorBanner message={error} />}

          {!loading && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex justify-between items-center">
                 <div>
                    <div className="text-xs text-slate-500 uppercase font-semibold">Current Delay</div>
                    <div className="mt-1"><DelayBadge delayMinutes={currentDelay} size="lg" /></div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Location</div>
                    <div className="mt-1 font-mono text-sm">{Math.round(currentRun.currentKm || 0)} km / {currentRun.totalKm || 803} km</div>
                 </div>
              </div>

              {/* Explanations */}
              {currentPrediction && (
                <DelayExplanation prediction={currentPrediction} />
              )}

              {/* Mini Timeline */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                 <h3 className="font-semibold text-slate-800 mb-4">Route Progress</h3>
                 <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                    {stationLog.map((log, i) => {
                       const isPast = log.arrived;
                       return (
                         <div key={log.stationCode} className="relative pl-6">
                           <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${isPast ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                           <div className="flex justify-between">
                              <span className={`text-sm font-medium ${isPast ? 'text-slate-700' : 'text-slate-500'}`}>{log.stationName} ({log.stationCode})</span>
                              <span className="text-xs font-mono text-slate-500">
                                 {isPast ? `Arr: +${log.delayMinutes || 0}m` : 'Expected'}
                              </span>
                           </div>
                         </div>
                       )
                    })}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

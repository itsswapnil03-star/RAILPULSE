// Shared utility for unified train delays and status calculations across all views

export function getTrainDelay(trainObj, liveTrainsMap = null) {
  if (!trainObj) return 0;
  
  // 1. Check live socket run if available
  const runObj = (liveTrainsMap && liveTrainsMap.get(trainObj.trainNumber)) || 
                 trainObj.currentRun || 
                 trainObj;

  if (runObj.currentDelay !== undefined && runObj.currentDelay !== null) {
    return runObj.currentDelay;
  }
  if (trainObj.currentDelay !== undefined && trainObj.currentDelay !== null) {
    return trainObj.currentDelay;
  }

  // 2. Check station log arrived halts
  const log = runObj.stationLog || trainObj.schedule || [];
  const arrivedStops = log.filter(s => s.arrived);
  if (arrivedStops.length > 0) {
    const lastHalt = arrivedStops[arrivedStops.length - 1];
    if (lastHalt.delayMinutes !== undefined && lastHalt.delayMinutes !== null) {
      return lastHalt.delayMinutes;
    }
  }

  // 3. Fallback only if train has no delay metadata
  return 0;
}

export function getDelayBadgeInfo(delayMinutes) {
  if (delayMinutes > 10) {
    return {
      label: `+${delayMinutes}m`,
      statusText: `DELAYED +${delayMinutes}m`,
      pillBg: 'bg-[#EF4444]/10',
      pillBorder: 'border-[#EF4444]/20',
      textColor: 'text-[#EF4444]',
      colorCode: '#EF4444',
      isDelayed: true
    };
  }
  if (delayMinutes > 0) {
    return {
      label: `+${delayMinutes}m`,
      statusText: `+${delayMinutes}m CAUTION`,
      pillBg: 'bg-[#F59E0B]/10',
      pillBorder: 'border-[#F59E0B]/20',
      textColor: 'text-[#F59E0B]',
      colorCode: '#F59E0B',
      isDelayed: false
    };
  }
  return {
    label: 'ON TIME',
    statusText: 'ON TIME',
    pillBg: 'bg-[#10B981]/10',
    pillBorder: 'border-[#10B981]/20',
    textColor: 'text-[#10B981]',
    colorCode: '#10B981',
    isDelayed: false
  };
}

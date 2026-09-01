"""
Unit tests for RailPulse Conflict Detection (Feature 1 & 2) and Corridor Trend Analytics (Feature 3).
"""
import pytest
from datetime import datetime, timedelta

def detect_conflicts_py(active_runs, buffer_minutes=6):
    """
    Python reference implementation of the RailPulse conflict detection logic.
    """
    station_map = {}
    for run in active_runs:
        for stop in run.get('station_log', []):
            code = stop['station_code']
            if code not in station_map:
                station_map[code] = []
            station_map[code].append({
                'train_number': run['train_number'],
                'train_type': run.get('train_type', 'Express'),
                'station_code': code,
                'station_name': stop.get('station_name', code),
                'arrival_time': stop['estimated_arrival'],
                'current_delay': stop.get('delay_minutes', 0),
                'prev_station': stop.get('prev_station', 'Outer Section')
            })
    
    conflicts = []
    for code, arrivals in station_map.items():
        if len(arrivals) < 2:
            continue
        for i in range(len(arrivals)):
            for j in range(i + 1, len(arrivals)):
                a, b = arrivals[i], arrivals[j]
                if a['train_number'] == b['train_number']:
                    continue
                diff_min = abs((a['arrival_time'] - b['arrival_time']).total_seconds()) / 60.0
                if diff_min <= buffer_minutes:
                    time_gap = max(1, round(diff_min))
                    severity = 'high' if time_gap <= 3 else 'medium'
                    
                    # Recommendation heuristic
                    prio = {'Semi-high-speed': 100, 'Superfast': 80, 'Intercity': 70, 'Express': 60}
                    prio_a = prio.get(a['train_type'], 60)
                    prio_b = prio.get(b['train_type'], 60)
                    
                    if abs(prio_a - prio_b) >= 15:
                        lower = a if prio_a < prio_b else b
                        higher = b if prio_a < prio_b else a
                        rec = f"Hold #{lower['train_number']} at {lower['prev_station']} to grant precedence to #{higher['train_number']}"
                    else:
                        rec = f"Reassign #{b['train_number']} to Platform 3 Loop at {a['station_name']}"
                    
                    conflicts.append({
                        'station_code': code,
                        'severity': severity,
                        'trains_involved': [a['train_number'], b['train_number']],
                        'time_gap_minutes': time_gap,
                        'recommendation': rec
                    })
    return conflicts


def aggregate_corridor_trends_py(trend_records, days=7):
    """
    Python reference implementation of the corridor trend aggregation endpoint logic.
    """
    daily_buckets = {}
    for rec in trend_records:
        date_str = rec['date']
        if date_str not in daily_buckets:
            daily_buckets[date_str] = {'pred_sum': 0.0, 'act_sum': 0.0, 'count': 0}
        daily_buckets[date_str]['pred_sum'] += rec['predicted_delay']
        daily_buckets[date_str]['act_sum'] += rec['actual_delay']
        daily_buckets[date_str]['count'] += 1
    
    result = []
    for date_str, bucket in sorted(daily_buckets.items()):
        c = bucket['count']
        avg_pred = round(bucket['pred_sum'] / c, 1)
        avg_act = round(bucket['act_sum'] / c, 1)
        accuracy = max(50, round(100 - abs(avg_pred - avg_act) * 3))
        result.append({
            'date': date_str,
            'avg_predicted_delay': avg_pred,
            'avg_actual_delay': avg_act,
            'accuracy': accuracy,
            'total_services': c
        })
    return result


def test_conflict_detection_high_severity():
    """Test Feature 1 & 2: Conflict detection flags <= 3 min time gap as high severity."""
    now = datetime(2026, 8, 31, 6, 0, 0)
    runs = [
        {
            'train_number': '22225',
            'train_type': 'Semi-high-speed',
            'station_log': [
                {'station_code': 'CSMT', 'station_name': 'Mumbai CSMT', 'estimated_arrival': now + timedelta(minutes=15), 'prev_station': 'Dadar'}
            ]
        },
        {
            'train_number': '11403',
            'train_type': 'Express',
            'station_log': [
                {'station_code': 'CSMT', 'station_name': 'Mumbai CSMT', 'estimated_arrival': now + timedelta(minutes=17), 'prev_station': 'Thane'}
            ]
        }
    ]
    
    conflicts = detect_conflicts_py(runs, buffer_minutes=6)
    assert len(conflicts) == 1
    c = conflicts[0]
    assert c['station_code'] == 'CSMT'
    assert c['severity'] == 'high'
    assert c['time_gap_minutes'] == 2
    assert '22225' in c['trains_involved']
    assert '11403' in c['trains_involved']
    assert "Hold #11403 at Thane" in c['recommendation']


def test_conflict_detection_no_conflict():
    """Test Feature 1: No conflicts flagged when arrival gap exceeds buffer window."""
    now = datetime(2026, 8, 31, 6, 0, 0)
    runs = [
        {
            'train_number': '22225',
            'station_log': [{'station_code': 'PUNE', 'estimated_arrival': now + timedelta(minutes=10)}]
        },
        {
            'train_number': '12139',
            'station_log': [{'station_code': 'PUNE', 'estimated_arrival': now + timedelta(minutes=30)}]
        }
    ]
    conflicts = detect_conflicts_py(runs, buffer_minutes=6)
    assert len(conflicts) == 0


def test_corridor_trend_aggregation():
    """Test Feature 3: Aggregation calculates average predicted vs actual delays by date."""
    records = [
        {'date': '2026-08-25', 'predicted_delay': 5.0, 'actual_delay': 6.0},
        {'date': '2026-08-25', 'predicted_delay': 7.0, 'actual_delay': 6.0},
        {'date': '2026-08-26', 'predicted_delay': 10.0, 'actual_delay': 12.0},
        {'date': '2026-08-26', 'predicted_delay': 8.0, 'actual_delay': 8.0}
    ]
    
    trends = aggregate_corridor_trends_py(records)
    assert len(trends) == 2
    day1 = trends[0]
    assert day1['date'] == '2026-08-25'
    assert day1['avg_predicted_delay'] == 6.0
    assert day1['avg_actual_delay'] == 6.0
    assert day1['accuracy'] == 100
    assert day1['total_services'] == 2

    day2 = trends[1]
    assert day2['date'] == '2026-08-26'
    assert day2['avg_predicted_delay'] == 9.0
    assert day2['avg_actual_delay'] == 10.0
    assert day2['total_services'] == 2

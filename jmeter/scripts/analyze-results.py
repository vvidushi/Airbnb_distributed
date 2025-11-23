#!/usr/bin/env python3
"""
JMeter Results Analyzer
Analyzes JMeter test results and generates performance graphs
"""

import os
import glob
import csv
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
from collections import defaultdict

# Directories
RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')
REPORTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports')

def parse_jtl_file(filepath):
    """Parse JMeter JTL results file"""
    results = []
    
    try:
        with open(filepath, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                results.append({
                    'label': row.get('label', ''),
                    'elapsed': int(row.get('elapsed', 0) or 0),
                    'success': row.get('success', 'true') == 'true',
                    'responseCode': row.get('responseCode', ''),
                    'bytes': int(row.get('bytes', 0) or 0),
                    'latency': int(row.get('Latency', 0) or 0)
                })
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    
    return results

def calculate_metrics(results):
    """Calculate performance metrics"""
    if not results:
        return {
            'avg_response_time': 0,
            'min_response_time': 0,
            'max_response_time': 0,
            'percentile_90': 0,
            'percentile_95': 0,
            'percentile_99': 0,
            'error_rate': 0,
            'throughput': 0,
            'total_requests': 0
        }
    
    response_times = [r['elapsed'] for r in results]
    successful = [r for r in results if r['success']]
    errors = [r for r in results if not r['success']]
    
    metrics = {
        'avg_response_time': np.mean(response_times) if response_times else 0,
        'min_response_time': min(response_times) if response_times else 0,
        'max_response_time': max(response_times) if response_times else 0,
        'percentile_90': np.percentile(response_times, 90) if response_times else 0,
        'percentile_95': np.percentile(response_times, 95) if response_times else 0,
        'percentile_99': np.percentile(response_times, 99) if response_times else 0,
        'error_rate': (len(errors) / len(results) * 100) if results else 0,
        'throughput': len(results) / (max([r['elapsed'] for r in results]) / 1000) if results else 0,
        'total_requests': len(results),
        'successful_requests': len(successful),
        'failed_requests': len(errors)
    }
    
    return metrics

def extract_user_count(filename):
    """Extract user count from filename"""
    import re
    match = re.search(r'(\d+)users', filename)
    return int(match.group(1)) if match else 0

def analyze_all_results():
    """Analyze all JTL result files"""
    result_files = glob.glob(os.path.join(RESULTS_DIR, '*.jtl'))
    
    if not result_files:
        print(f"❌ No result files found in {RESULTS_DIR}")
        print("   Run load tests first: ./scripts/run-load-tests.sh")
        return None
    
    print(f"📊 Found {len(result_files)} result files")
    print("")
    
    results_by_users = defaultdict(list)
    
    # Parse all files
    for filepath in result_files:
        filename = os.path.basename(filepath)
        user_count = extract_user_count(filename)
        
        if user_count == 0:
            continue
        
        print(f"   Analyzing: {filename}")
        results = parse_jtl_file(filepath)
        
        if results:
            metrics = calculate_metrics(results)
            results_by_users[user_count].append(metrics)
    
    # Aggregate metrics by user count
    aggregated = {}
    for user_count, metrics_list in sorted(results_by_users.items()):
        if metrics_list:
            # Average metrics across multiple runs
            aggregated[user_count] = {
                'avg_response_time': np.mean([m['avg_response_time'] for m in metrics_list]),
                'percentile_95': np.mean([m['percentile_95'] for m in metrics_list]),
                'error_rate': np.mean([m['error_rate'] for m in metrics_list]),
                'throughput': np.mean([m['throughput'] for m in metrics_list]),
                'total_requests': sum([m['total_requests'] for m in metrics_list])
            }
    
    return aggregated

def generate_graphs(results):
    """Generate performance graphs"""
    if not results:
        print("❌ No results to graph")
        return
    
    user_counts = sorted(results.keys())
    avg_times = [results[u]['avg_response_time'] for u in user_counts]
    p95_times = [results[u]['percentile_95'] for u in user_counts]
    error_rates = [results[u]['error_rate'] for u in user_counts]
    throughputs = [results[u]['throughput'] for u in user_counts]
    
    # Create figure with subplots
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Airbnb Application Performance Test Results', fontsize=16, fontweight='bold')
    
    # 1. Response Time vs Concurrent Users
    ax1.plot(user_counts, avg_times, 'b-o', label='Average', linewidth=2, markersize=8)
    ax1.plot(user_counts, p95_times, 'r--s', label='95th Percentile', linewidth=2, markersize=8)
    ax1.set_xlabel('Concurrent Users', fontsize=12)
    ax1.set_ylabel('Response Time (ms)', fontsize=12)
    ax1.set_title('Response Time vs Load', fontsize=14, fontweight='bold')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # 2. Error Rate vs Concurrent Users
    ax2.plot(user_counts, error_rates, 'r-o', linewidth=2, markersize=8)
    ax2.set_xlabel('Concurrent Users', fontsize=12)
    ax2.set_ylabel('Error Rate (%)', fontsize=12)
    ax2.set_title('Error Rate vs Load', fontsize=14, fontweight='bold')
    ax2.grid(True, alpha=0.3)
    ax2.set_ylim(bottom=0)
    
    # 3. Throughput vs Concurrent Users
    ax3.plot(user_counts, throughputs, 'g-o', linewidth=2, markersize=8)
    ax3.set_xlabel('Concurrent Users', fontsize=12)
    ax3.set_ylabel('Throughput (req/s)', fontsize=12)
    ax3.set_title('Throughput vs Load', fontsize=14, fontweight='bold')
    ax3.grid(True, alpha=0.3)
    
    # 4. Performance Summary Table
    ax4.axis('tight')
    ax4.axis('off')
    table_data = [['Users', 'Avg Time (ms)', 'P95 (ms)', 'Error %', 'Throughput']]
    for u in user_counts:
        table_data.append([
            str(u),
            f"{results[u]['avg_response_time']:.1f}",
            f"{results[u]['percentile_95']:.1f}",
            f"{results[u]['error_rate']:.2f}",
            f"{results[u]['throughput']:.1f}"
        ])
    
    table = ax4.table(cellText=table_data, cellLoc='center', loc='center',
                      colWidths=[0.15, 0.2, 0.2, 0.2, 0.2])
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 2)
    
    # Style header row
    for i in range(5):
        table[(0, i)].set_facecolor('#4CAF50')
        table[(0, i)].set_text_props(weight='bold', color='white')
    
    plt.tight_layout()
    
    # Save graph
    output_file = os.path.join(REPORTS_DIR, f'performance-analysis-{datetime.now().strftime("%Y%m%d-%H%M%S")}.png')
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"")
    print(f"📈 Graph saved: {output_file}")
    
    # Show graph
    plt.show()

def print_analysis(results):
    """Print detailed analysis"""
    if not results:
        return
    
    print("")
    print("=" * 80)
    print("PERFORMANCE ANALYSIS REPORT")
    print("=" * 80)
    print("")
    
    user_counts = sorted(results.keys())
    
    for user_count in user_counts:
        metrics = results[user_count]
        print(f"📊 {user_count} Concurrent Users:")
        print(f"   Average Response Time: {metrics['avg_response_time']:.2f} ms")
        print(f"   95th Percentile:       {metrics['percentile_95']:.2f} ms")
        print(f"   Error Rate:            {metrics['error_rate']:.2f}%")
        print(f"   Throughput:            {metrics['throughput']:.2f} req/s")
        print(f"   Total Requests:        {metrics['total_requests']}")
        print("")
    
    # Performance insights
    print("=" * 80)
    print("PERFORMANCE INSIGHTS")
    print("=" * 80)
    print("")
    
    if len(user_counts) >= 2:
        first_avg = results[user_counts[0]]['avg_response_time']
        last_avg = results[user_counts[-1]]['avg_response_time']
        degradation = ((last_avg - first_avg) / first_avg) * 100
        
        print(f"📈 Response Time Degradation:")
        print(f"   From {user_counts[0]} to {user_counts[-1]} users: {degradation:.1f}% increase")
        print("")
        
        # Find bottleneck
        max_error_users = max(user_counts, key=lambda u: results[u]['error_rate'])
        if results[max_error_users]['error_rate'] > 1.0:
            print(f"⚠️  Bottleneck Detected:")
            print(f"   Highest error rate at {max_error_users} users: {results[max_error_users]['error_rate']:.2f}%")
            print(f"   Recommendation: Optimize for loads > {max_error_users} users")
        else:
            print(f"✅ System Performance:")
            print(f"   Error rates remain low across all tested loads")
            print(f"   System handles up to {user_counts[-1]} concurrent users well")
        print("")

if __name__ == '__main__':
    print("🔬 JMeter Results Analyzer")
    print("=" * 80)
    print("")
    
    # Analyze results
    results = analyze_all_results()
    
    if results:
        # Print analysis
        print_analysis(results)
        
        # Generate graphs
        try:
            generate_graphs(results)
        except Exception as e:
            print(f"❌ Error generating graphs: {e}")
            print("   Make sure matplotlib is installed: pip install matplotlib numpy")
    else:
        print("❌ No results to analyze")


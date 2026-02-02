"""
P&T TOWNHALL RACING GAME
Premium Racing Experience for C-Level Presentation
Telkomsel Enterprise Solutions
"""

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)

# Database file - use /data directory for Fly.io persistent storage
DB_FILE = os.getenv('DB_FILE', '/data/game_scores.json') if os.path.exists('/data') else 'game_scores.json'

def load_scores():
    """Load scores from JSON database"""
    if not os.path.exists(DB_FILE):
        return []
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_scores(scores):
    """Save scores to JSON database"""
    with open(DB_FILE, 'w') as f:
        json.dump(scores, f, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/submit-score', methods=['POST'])
def submit_score():
    """Submit player score to database"""
    try:
        data = request.json
        player_name = data.get('playerName', 'Anonymous')
        score = int(data.get('score', 0))
        distance = float(data.get('distance', 0))
        max_speed = int(data.get('maxSpeed', 0))
        
        # Load existing scores
        scores = load_scores()
        
        # Add new score
        new_entry = {
            'playerName': player_name,
            'score': score,
            'distance': distance,
            'maxSpeed': max_speed,
            'timestamp': datetime.now().isoformat(),
            'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        scores.append(new_entry)
        
        # Sort by score (highest first)
        scores.sort(key=lambda x: x['score'], reverse=True)
        
        # Keep top 100 scores
        scores = scores[:100]
        
        # Save to database
        save_scores(scores)
        
        # Get player's rank
        rank = next((i + 1 for i, s in enumerate(scores) if s['timestamp'] == new_entry['timestamp']), None)
        
        return jsonify({
            'success': True,
            'rank': rank,
            'totalPlayers': len(scores),
            'message': 'Score saved successfully!'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top 10 leaderboard"""
    try:
        scores = load_scores()
        top_10 = scores[:10]
        
        return jsonify({
            'success': True,
            'leaderboard': top_10,
            'totalPlayers': len(scores)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall game statistics"""
    try:
        scores = load_scores()
        
        if not scores:
            return jsonify({
                'success': True,
                'stats': {
                    'totalPlayers': 0,
                    'totalGames': 0,
                    'highestScore': 0,
                    'averageScore': 0,
                    'longestDistance': 0
                }
            })
        
        stats = {
            'totalPlayers': len(set(s['playerName'] for s in scores)),
            'totalGames': len(scores),
            'highestScore': max(s['score'] for s in scores),
            'averageScore': sum(s['score'] for s in scores) / len(scores),
            'longestDistance': max(s['distance'] for s in scores),
            'fastestSpeed': max(s['maxSpeed'] for s in scores)
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Get port from environment variable (for Fly.io) or use default
    port = int(os.getenv('PORT', 5000))
    
    print("""
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                                                                   ║
    ║       🏁  P&T TOWNHALL RACING GAME  🏁                           ║
    ║                                                                   ║
    ║       Premium Racing Experience                                  ║
    ║       Telkomsel Enterprise Solutions                             ║
    ║                                                                   ║
    ║       Server Running on port: {}                              ║
    ║                                                                   ║
    ║       Features:                                                  ║
    ║       ✓ Player Registration                                      ║
    ║       ✓ Score Tracking                                           ║
    ║       ✓ Leaderboard System                                       ║
    ║       ✓ Real-time Statistics                                     ║
    ║       ✓ Explosion Effects                                        ║
    ║                                                                   ║
    ╚═══════════════════════════════════════════════════════════════════╝
    """.format(port))
    
    # Use debug=False in production
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
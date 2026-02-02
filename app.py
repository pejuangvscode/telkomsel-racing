"""
Telkomsel FleetSight Racing - Asphalt 8 Style
Premium 3D Racing Game untuk C-Level Presentation
"""

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    print("""
    ╔════════════════════════════════════════════════════════════════╗
    ║  🏎️  TELKOMSEL FLEETSIGHT RACING - ASPHALT STYLE  🏎️          ║
    ║  Server: http://localhost:5000                                 ║
    ╚════════════════════════════════════════════════════════════════╝
    """)
    app.run(debug=True, host='0.0.0.0', port=5000)

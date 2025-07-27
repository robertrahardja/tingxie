#!/usr/bin/env python3
"""
Simple HTTP server with auto-reload capability
"""
import http.server
import socketserver
import os
import time
import threading
import webbrowser
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

PORT = 8000

class ReloadHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith(('.html', '.css', '.js')):
            print(f"Change detected in {event.src_path}")
            # Note: You'll need to manually refresh browser
            print("➜ Refresh your browser to see changes")

def start_server():
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()

if __name__ == "__main__":
    # Check if watchdog is installed
    try:
        # Start file watcher
        event_handler = ReloadHandler()
        observer = Observer()
        observer.schedule(event_handler, path='.', recursive=True)
        observer.start()
        
        # Open browser
        webbrowser.open(f'http://localhost:{PORT}')
        
        # Start server
        try:
            start_server()
        except KeyboardInterrupt:
            observer.stop()
            print("\nServer stopped")
        observer.join()
    except ImportError:
        print("For auto-reload notifications, install watchdog:")
        print("pip3 install watchdog")
        print("\nStarting basic server without auto-reload...")
        webbrowser.open(f'http://localhost:{PORT}')
        start_server()
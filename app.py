from flask import Flask, jsonify, send_file
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os
import io
from googleapiclient.http import MediaIoBaseDownload
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
FOLDER_ID = '15hieU52VWdlwZcHdou5b9OAEIwGiDhPh'
  # replace with your actual folder ID

# Get authorized Google Drive service
def get_drive_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    else:
        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
        creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return build('drive', 'v3', credentials=creds)

@app.route('/api/screenshots')
def list_images():
    service = get_drive_service()
    response = service.files().list(
        q=f"'{FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false",
        fields="files(id, name, createdTime)").execute()

    files = response.get('files', [])
    results = []

    for file in files:
        results.append({
            'id': file['id'],
            'name': file['name'],
            'timestamp': file['createdTime'],
            'screenshot_url': f'/api/image/{file["id"]}',
            'original_url': f'https://drive.google.com/file/d/{file["id"]}/view?usp=sharing',
            'parent_id': 'DriveFolder',
            'risk_level': 'unknown',
            'status': 'unreviewed'
        })

    return jsonify(results)

@app.route('/api/image/<file_id>')
def get_image(file_id):
    service = get_drive_service()
    request = service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    fh.seek(0)
    return send_file(fh, mimetype='image/jpeg')  # Can dynamically detect type

if __name__ == '__main__':
    app.run(debug=True)

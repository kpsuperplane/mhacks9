import os
from flask import Flask, render_template, request, send_from_directory, jsonify
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import speech_recognition as sr
import configparser
import time

app = Flask(__name__, static_url_path='/public/public', template_folder='public/public')
CORS(app)

config = configparser.ConfigParser()
config.read('secrets.cfg')
upload_path = config['mhacks']['path']
domain = config['mhacks']['domain']
wit = config['mhacks']['wit']
houndify_id = config['mhacks']['houndify_id']
houndify_key = config['mhacks']['houndify_key']
ibm_username = config['mhacks']['ibm_username']
ibm_password = config['mhacks']['ibm_password']
microsoft = config['mhacks']['microsoft']
google_credentials = open('google_credentials.json', 'r').read()

r = sr.Recognizer()
r.energy_threshold = 4000
r.dynamic_energy_threshold = True

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/files/<path:filename>')
def download_file(filename):
    return send_from_directory(upload_path, filename)

@app.route('/audio', methods=['POST'])
def audio():
    if request.method == 'POST':
        if 'file' not in request.files:
            return 'No file upload'
        file = request.files['file']
        if file.filename == '':
            return 'No filename'
        if file:
            filename = str(int(time.time()))
            print(filename)
            webm_path = os.path.join(upload_path, filename + ".webm")
            flac_path = os.path.join(upload_path, filename + ".flac")
            file.save(webm_path)
            os.system("ffmpeg -i {} -ar 16000 -ac 1 {}".format(webm_path, flac_path))
            # with sr.AudioFile(flac_path) as source:
                # r.adjust_for_ambient_noise(source, duration = 1)
                # audio = r.record(source)
                # try:
                    # return jsonify({
                        # "webm_path": domain + "/files/" + filename + ".webm",
                        # "flac_path": domain + "/files/" + filename + ".flac",
                        # "transcripts": {
                            # # "wit": r.recognize_wit(audio, wit),
                            # # "ibm": r.recognize_ibm(audio, ibm_username, ibm_password, language="en-US"),
                            # # "bing": r.recognize_bing(audio, microsoft, language="en-US"),
                            # # "houndify": r.recognize_houndify(audio, houndify_id, houndify_key),
                            # # "google": r.recognize_google_cloud(audio, credentials_json=google_credentials, language="en-US"),
                            # "sphinx": r.recognize_sphinx(audio, language="en-US")
                        # }
                    # })
                # except sr.UnknownValueError:
                    # return jsonify({
                        # "webm_path": domain + "/files/" + filename + ".webm",
                        # "flac_path": domain + "/files/" + filename + ".flac",
                        # "transcripts": {
                            # "error": "speech is unintelligible"
                        # }
                    # })
                # except Exception as e:
                    # print(e)
                    # return jsonify({
                        # "webm_path": domain + "/files/" + filename + ".webm",
                        # "flac_path": domain + "/files/" + filename + ".flac",
                        # "transcripts": {
                            # "error": "speech is unintelligible"
                        # }
                    # })
            return jsonify({
                "webm_path": domain + "/files/" + filename + ".webm",
                "flac_path": domain + "/files/" + filename + ".flac"
            })
        else:
            return 'No file'
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

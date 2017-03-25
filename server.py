import os
from flask import Flask, render_template, request
from werkzeug.utils import secure_filename
import speech_recognition as sr
import configparser
import time

app = Flask(__name__, static_url_path='/public/build', template_folder='public/build')

config = configparser.ConfigParser()
config.read('secrets.cfg')
upload_path = config['mhacks']['path']
wit = config['mhacks']['wit']
houndify_id = config['mhacks']['houndify_id']
houndify_key = config['mhacks']['houndify_key']

r = sr.Recognizer()
r.energy_threshold = 4000
r.dynamic_energy_threshold = True

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/audio', methods=['POST'])
def audio():
    if request.method == 'POST':
        print(request.files)
        if 'file' not in request.files:
            return 'No file upload'
        file = request.files['file']
        if file.filename == '':
            return 'No file upload 2'
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(upload_path, filename)
            outputpath = os.path.join(upload_path, str(time.time()) + ".flac")
            file.save(filepath)
            os.system("ffmpeg -i {} -ar 16000 -ac 1 {}".format(filepath, outputpath))
            with sr.AudioFile(outputpath) as source:
                audio = r.record(source)
                # print(r.recognize_wit(audio, wit))
                return r.recognize_houndify(audio, houndify_id, houndify_key)
        else:
            return 'No file upload 3'
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

from flask import Flask, request
import subprocess
import os

app = Flask(__name__)

@app.route('/text', methods=["POST"])
def main_text():
    if (request.data is None or len(request.data) < 1):
        print "No payload"
        return "", 400
    print request.data
    with open("/root/input.txt", "w") as text_file:
        text_file.write(request.data)
    process_results = subprocess.Popen("sh /root/work.sh", shell=True, cwd="/opt/tensorflow/models/syntaxnet")
    process_results.wait()
    final_results = open('/root/output.conll', 'r').read()
    try:
        os.remove("/root/input.txt")
    except OSError:
        pass
    try:
        os.remove('/root/output.conll')
    except OSError:
        pass

    return final_results

@app.errorhandler(404)
def page_not_found(e):
    return 'This server only deals with POST requests at /text'

app.run(host='0.0.0.0', port=5005)

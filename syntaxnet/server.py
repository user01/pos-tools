from flask import Flask, request
import subprocess

app = Flask(__name__)

@app.route('/text', methods=["POST"])
def main_text():
    with open("/root/input.txt", "w") as text_file:
        text_file.write(request.data)
    process_results = subprocess.Popen("sh /root/work.sh", shell=True, cwd="/opt/tensorflow/models/syntaxnet")
    process_results.wait()
    final_results = open('/root/output.conll', 'r').read()
    return final_results

@app.errorhandler(404)
def page_not_found(e):
    return 'This server only deals with POST requests at /text'

app.run(host='0.0.0.0', port=5005)

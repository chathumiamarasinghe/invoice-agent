from flask import Flask, request, jsonify, render_template_string
from pipeline import process_invoice
from api_routes import (
    get_dashboard_data, get_invoices_list,
    get_invoice_by_id, get_accuracy_data,
)
import os

app = Flask(__name__)

PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>AP Invoice Automation</title>
    <style>
        body {
            font-family: Arial;
            margin: 50px;
            background: #f4f6f8;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            width: 500px;
            box-shadow: 0px 0px 10px #ccc;
        }
        h2 {
            color: #333;
        }
        input {
            margin-top: 15px;
        }
        button {
            margin-top: 20px;
            padding: 10px 15px;
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 5px;
        }
        button:hover {
            background: #0056b3;
        }
        pre {
            background: #111;
            color: #0f0;
            padding: 15px;
            margin-top: 20px;
            overflow-x: auto;
        }
    </style>
</head>

<body>
<div class="container">
    <h2>AP Invoice Automation</h2>
    <p>Upload an invoice PDF — AI extracts, validates, and routes it.</p>

    <form id="uploadForm">
        <input type="file" name="file" id="file" required />
        <br/>
        <button type="submit">Extract Invoice Data</button>
    </form>

    <pre id="result"></pre>
</div>

<script>
document.getElementById("uploadForm").onsubmit = async function(e) {
    e.preventDefault();

    let fileInput = document.getElementById("file");
    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    let response = await fetch("/extract", {
        method: "POST",
        body: formData
    });

    let data = await response.json();
    document.getElementById("result").textContent =
        JSON.stringify(data, null, 2);
};
</script>

</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(PAGE)

@app.route('/extract', methods=['POST'])
def extract():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    f = request.files['file']
    path = f"temp_{f.filename}"
    f.save(path)

    try:
        result = process_invoice(path)
    finally:
        if os.path.exists(path):
            os.remove(path)

    return jsonify(result)


@app.route('/api/dashboard')
def api_dashboard():
    return jsonify(get_dashboard_data())


@app.route('/api/invoices')
def api_invoices():
    return jsonify(get_invoices_list())


@app.route('/api/invoice/<int:invoice_id>')
def api_invoice_detail(invoice_id):
    inv = get_invoice_by_id(invoice_id)
    if not inv:
        return jsonify({"error": "Invoice not found"}), 404
    return jsonify(inv)


@app.route('/api/accuracy')
def api_accuracy():
    return jsonify(get_accuracy_data())


if __name__ == '__main__':
    print("Demo running at: http://localhost:5000")
    app.run(debug=True, port=5000)
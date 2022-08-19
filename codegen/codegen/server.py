from flask import Flask, request, render_template
from transformers import AutoTokenizer, AutoModelForCausalLM

app = Flask(__name__)


@app.route('/generate', methods=['GET', 'POST'])
def handle_post():

    if request.method == 'POST':
        text = request.form['input']
        tokenizer = AutoTokenizer.from_pretrained("Salesforce/codegen-16B-multi")
        model = AutoModelForCausalLM.from_pretrained("Salesforce/codegen-16B-multi", load_in_8bit=True)
        input_ids = tokenizer(text, return_tensors="pt").input_ids
        generated_ids = model.generate(input_ids, max_length=128)
        output = tokenizer.decode(generated_ids[0], skip_special_tokens=True)
        print(output)
        return render_template('codegen.html', input=text, output=output)
    
    return render_template('codegen.html', input='', output='')


@app.route('/health')
def health():
    return "ok"


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',port=80)
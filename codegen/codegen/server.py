from flask import Flask, request, render_template
from transformers import AutoTokenizer, AutoModelForCausalLM

app = Flask(__name__)


@app.route('/generate', methods=['GET', 'POST'])
def handle_post():

    if request.method == 'POST':
        text = request.form['input']
        tokenizer = AutoTokenizer.from_pretrained("Salesforce/codegen-16B-multi")
        model = AutoModelForCausalLM.from_pretrained("Salesforce/codegen-16B-multi",
                                    device_map="auto", 
                                    load_in_8bit=True)
        model.eval()
        model.to('cuda') 

        tokenized = tokenizer(text, return_tensors="pt")
        input_ids = tokenized.input_ids.to('cuda')
        attention_mask = tokenized.attention_mask.to('cuda')

        generated_ids = model.generate(input_ids, 
                                    attention_mask=attention_mask, 
                                    temperature=0.,  
                                    max_length=528)
        output = tokenizer.decode(generated_ids[0], skip_special_tokens=True)
        return render_template('codegen.html', input=text, output=output)
    
    return render_template('codegen.html', input='', output='')


@app.route('/health')
def health():
    return "ok"


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',port=80)
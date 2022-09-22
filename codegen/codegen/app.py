import time
from .settings import Config
from flask import Flask, request, render_template

app = Flask(__name__)

config = Config()


def timeit(func: Callable):  # type: ignore
    @wraps(func)  # type: ignore
    def timeit_wrapper(*args, **kwargs):  # type: ignore
        start_time = time.perf_counter()
        result = None
        try:
            result = func(*args, **kwargs)
            return result
        except Exception as e:
            app.logger.error(f"Function {func.__name__}{args} {kwargs} failed with {e}")
            raise e
        finally:
            end_time = time.perf_counter()
            total_time = end_time - start_time
            app.logger.info(
                f"Function {func.__name__}{args} {kwargs} Took {total_time:.4f} seconds"
            )
    return timeit_wrapper

@timeit
@app.route('/', methods=['GET', 'POST'])
def handle_post():

    if request.method == 'POST':
        text = request.form['input'].strip()
        tokens = int(request.form['fname'])
        output = config.code.generate(text, tokens)
        return render_template('codegen.html', input=text.strip(), 
                output=output.strip(), 
                fname = tokens)
    
    return render_template('codegen.html', input='', output='', fname = 30)

@app.route('/health')
def health():
    return "ok"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

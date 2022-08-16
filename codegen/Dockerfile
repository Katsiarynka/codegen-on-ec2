FROM nvidia/cuda:11.7.0-devel-rockylinux8

RUN yum install -y python3 python3-pip
RUN pip install --no-cache-dir cryptography==2.1.4 

# System deps:
RUN pip3 install "poetry"
COPY poetry.lock pyproject.toml /app/

WORKDIR /app

RUN poetry config virtualenvs.create false
RUN poetry install --no-dev
RUN poetry shell

# Install essential Python packages
RUN python -m pip --no-cache-dir install \
    torch \
    torchvision \
    torchaudio \
    -f https://download.pytorch.org/whl/torch_stable.html \
    'jupyterlab>=2'

COPY codegen /app/codegen

ENV PYTHONPATH /app/codegen

CMD [ "python", "-m", "codegen.server" ]